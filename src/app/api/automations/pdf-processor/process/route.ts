import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080'
const KESTRA_AUTH = {
  username: process.env.KESTRA_USERNAME || 'admin',
  password: process.env.KESTRA_PASSWORD || 'admin123'
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request data
    const formData = await request.formData()
    const sourceType = formData.get('source_type') as string
    const destinationType = formData.get('destination_type') as string
    const destinationPath = formData.get('destination_path') as string
    
    let sourcePath: string
    
    // Handle file upload
    if (sourceType === 'upload') {
      const file = formData.get('file') as File
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf-uploads')
        .upload(`${session.user.id}/${file.name}`, file)

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      sourcePath = uploadData.path
    } else {
      sourcePath = formData.get('cloud_path') as string
    }

    // Create process record
    const { data: process, error: processError } = await supabase
      .from('automation_processes')
      .insert({
        user_id: session.user.id,
        automation_id: 'pdf-processor',
        status: 'pending',
        config: {
          source_type: sourceType,
          source_path: sourcePath,
          destination_type: destinationType,
          destination_path: destinationPath
        }
      })
      .select()
      .single()

    if (processError) {
      return NextResponse.json({ error: processError.message }, { status: 500 })
    }

    // Execute the workflow using Kestra's API
    const executionResponse = await fetch(`${KESTRA_URL}/api/v1/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${KESTRA_AUTH.username}:${KESTRA_AUTH.password}`).toString('base64')
      },
      body: JSON.stringify({
        namespace: 'whiztask',
        flowId: 'pdf-to-excel-processor',
        inputs: {
          source_type: sourceType,
          source_path: sourcePath,
          destination_type: destinationType,
          destination_path: destinationPath,
          google_credentials: process.env.GOOGLE_CREDENTIALS,
          dropbox_token: process.env.DROPBOX_TOKEN
        }
      })
    })

    if (!executionResponse.ok) {
      const error = await executionResponse.text()
      throw new Error(`Failed to start workflow: ${error}`)
    }

    const executionData = await executionResponse.json()

    // Update process with execution ID
    await supabase
      .from('automation_processes')
      .update({
        kestra_execution_id: executionData.id,
        status: 'running'
      })
      .eq('id', process.id)

    return NextResponse.json({
      message: 'PDF processing started',
      processId: process.id,
      executionId: executionData.id
    })

  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
