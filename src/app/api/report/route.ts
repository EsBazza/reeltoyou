import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // 1. Increment report_count and get the new value
    // We use a RPC or a raw increment to avoid race conditions
    const { data, error } = await supabaseAdmin
      .from('entries')
      .select('report_count, is_hidden')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const newReportCount = (data.report_count || 0) + 1;
    const shouldHide = newReportCount >= 3;

    // 2. Update the entry
    const { error: updateError } = await supabaseAdmin
      .from('entries')
      .update({ 
        report_count: newReportCount,
        is_hidden: data.is_hidden || shouldHide
      })
      .eq('slug', slug);

    if (updateError) {
      console.error('Report update error:', updateError);
      return NextResponse.json({ error: 'Failed to report' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: shouldHide ? 'Entry has been hidden for review.' : 'Report submitted.' 
    });

  } catch (error) {
    console.error('Report API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
