import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * POST /api/staff/rids/[id]/upload-biometric
 * Upload biometric files (photo, thumbmark, signature)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('file_type') as string; // 'photo', 'thumbmark', 'signature'

    if (!file || !fileType) {
      return NextResponse.json(
        { success: false, error: 'File and file_type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!['photo', 'thumbmark', 'signature'].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file_type. Must be photo, thumbmark, or signature' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for biometrics)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file mime type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and SVG images are allowed' },
        { status: 400 }
      );
    }

    // Get RIDS record to get reservist_id
    const { data: rids, error: ridsError } = await supabase
      .from('rids_forms')
      .select('reservist_id')
      .eq('id', params.id)
      .single();

    if (ridsError) {
      return NextResponse.json(
        { success: false, error: 'RIDS not found' },
        { status: 404 }
      );
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${rids.reservist_id}/${fileType}-${Date.now()}.${fileExt}`;

    logger.info('Uploading biometric file', {
      rids_id: params.id,
      file_type: fileType,
      file_name: fileName,
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rids-biometrics')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Failed to upload biometric file', uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rids-biometrics')
      .getPublicUrl(fileName);

    // Update RIDS record with file URL
    const updateField = `${fileType}_url`;
    const { data: updatedRIDS, error: updateError } = await supabase
      .from('rids_forms')
      .update({
        [updateField]: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update RIDS with file URL', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    logger.success('Biometric file uploaded successfully', {
      rids_id: params.id,
      file_type: fileType,
      url: publicUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        file_type: fileType,
        url: publicUrl,
        rids: updatedRIDS,
      },
      message: `${fileType} uploaded successfully`,
    });
  } catch (error) {
    logger.error('Unexpected error uploading biometric', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/rids/[id]/upload-biometric?file_type=photo
 * Delete biometric file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('file_type');

    if (!fileType || !['photo', 'thumbmark', 'signature'].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Valid file_type query parameter required' },
        { status: 400 }
      );
    }

    // Get current file URL from RIDS
    const urlField = `${fileType}_url`;
    const { data: rids, error: ridsError } = await supabase
      .from('rids_forms')
      .select(`${urlField}, reservist_id`)
      .eq('id', params.id)
      .single();

    if (ridsError) {
      return NextResponse.json(
        { success: false, error: 'RIDS not found' },
        { status: 404 }
      );
    }

    const fileUrl = rids[urlField];
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'No file to delete' },
        { status: 404 }
      );
    }

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('rids-biometrics') + 1).join('/');

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('rids-biometrics')
      .remove([filePath]);

    if (deleteError) {
      logger.error('Failed to delete biometric file', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    // Update RIDS record to remove URL
    const { error: updateError } = await supabase
      .from('rids_forms')
      .update({
        [urlField]: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    logger.success('Biometric file deleted successfully', {
      rids_id: params.id,
      file_type: fileType,
    });

    return NextResponse.json({
      success: true,
      message: `${fileType} deleted successfully`,
    });
  } catch (error) {
    logger.error('Unexpected error deleting biometric', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
