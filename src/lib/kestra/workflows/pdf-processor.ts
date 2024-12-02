import { KestraClient, KestraFlow, KestraTaskType } from '../client'

export function createPdfProcessorFlow(): KestraFlow {
  return {
    id: 'pdf-processor',
    namespace: 'whiztask',
    description: 'Converts PDF documents to Excel files, extracting structured data from tables and lists.',
    
    inputs: [
      {
        name: 'source_type',
        type: 'string',
        required: true,
        description: 'Source of the PDF file (upload/gdrive/dropbox)'
      },
      {
        name: 'source_path',
        type: 'string',
        required: true,
        description: 'Path or ID of the source file'
      },
      {
        name: 'destination_type',
        type: 'string',
        required: true,
        description: 'Destination for Excel file (gsheets/excel)'
      },
      {
        name: 'destination_path',
        type: 'string',
        required: true,
        description: 'Path or ID for the destination file'
      },
      {
        name: 'google_credentials',
        type: 'string',
        required: false,
        description: 'Google API credentials JSON (if using Google services)'
      },
      {
        name: 'dropbox_token',
        type: 'string',
        required: false,
        description: 'Dropbox access token (if using Dropbox)'
      }
    ],

    tasks: [
      {
        id: 'install-dependencies',
        type: KestraTaskType.PYTHON_SCRIPT,
        inputFiles: {
          'requirements.txt': [
            'PyPDF2==3.0.1',
            'pandas==2.0.3',
            'google-auth==2.22.0',
            'google-auth-oauthlib==1.0.0',
            'google-auth-httplib2==0.1.0',
            'google-api-python-client==2.97.0',
            'dropbox==11.36.2',
            'openpyxl==3.1.2'
          ].join('\n')
        },
        script: `
          import sys
          import subprocess
          subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        `
      },
      {
        id: 'process-pdf',
        type: KestraTaskType.PYTHON_SCRIPT,
        inputs: {
          source_type: '{{ inputs.source_type }}',
          source_path: '{{ inputs.source_path }}',
          destination_type: '{{ inputs.destination_type }}',
          destination_path: '{{ inputs.destination_path }}',
          google_credentials: '{{ inputs.google_credentials }}',
          dropbox_token: '{{ inputs.dropbox_token }}'
        },
        script: `
import os
import json
import tempfile
import PyPDF2
import pandas as pd
import re
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
import dropbox

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = [page.extract_text() for page in reader.pages]
    return text

def process_text_to_df(text):
    lines = text.split('\\n')
    data = []
    item_name = ""
    for line in lines:
        if line.strip():
            match = re.match(r"(.+?)\\s+(\\d+)\\s+([\\d.,]+)\\s+([\\d.,]+)\\s*(Covered|Not Covered)?$", line)
            if match:
                item_description = match.group(1).strip()
                item_number = match.group(2).strip()
                price_per_item = match.group(3).strip().replace('.', ',')
                total_price = match.group(4).strip().replace('.', ',')
                paid_or_not = match.group(5) if match.group(5) else "Not Covered"
                if item_name:
                    item_description = item_name + " " + item_description
                    item_name = ""
                data.append([item_description, item_number, price_per_item, total_price, paid_or_not])
            else:
                item_name += " " + line if item_name else line

    return pd.DataFrame(data, columns=['Item Name', 'Item Number', 'Price Per Item', 'Total Price', 'Paid or not'])

# Get source file
temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
temp_excel = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')

try:
    # Handle different source types
    if source_type == 'gdrive':
        creds = service_account.Credentials.from_service_account_info(
            json.loads(google_credentials),
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        service = build('drive', 'v3', credentials=creds)
        request = service.files().get_media(fileId=source_path)
        with open(temp_pdf.name, 'wb') as f:
            f.write(request.execute())

    elif source_type == 'dropbox':
        dbx = dropbox.Dropbox(dropbox_token)
        metadata, response = dbx.files_download(source_path)
        with open(temp_pdf.name, 'wb') as f:
            f.write(response.content)

    elif source_type == 'upload':
        with open(source_path, 'rb') as f:
            with open(temp_pdf.name, 'wb') as temp_f:
                temp_f.write(f.read())

    # Process PDF
    text = ''.join(extract_text_from_pdf(temp_pdf.name))
    df = process_text_to_df(text)
    df.to_excel(temp_excel.name, index=False)

    # Handle different destination types
    if destination_type == 'gsheets':
        creds = service_account.Credentials.from_service_account_info(
            json.loads(google_credentials),
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=creds)
        
        values = [df.columns.tolist()] + df.values.tolist()
        body = {'values': values}
        
        service.spreadsheets().values().update(
            spreadsheetId=destination_path,
            range='A1',
            valueInputOption='RAW',
            body=body
        ).execute()

    elif destination_type == 'excel':
        with open(temp_excel.name, 'rb') as f:
            if destination_type.startswith('dropbox://'):
                dbx = dropbox.Dropbox(dropbox_token)
                dbx.files_upload(f.read(), destination_path, mode=dropbox.files.WriteMode.overwrite)
            else:
                with open(destination_path, 'wb') as dest_f:
                    dest_f.write(f.read())

finally:
    # Cleanup temporary files
    os.unlink(temp_pdf.name)
    os.unlink(temp_excel.name)
        `
      }
    ]
  }
}

export async function deployPdfProcessorFlow() {
  const client = new KestraClient()
  const flow = createPdfProcessorFlow()
  
  try {
    await client.createFlow(flow)
    console.log('PDF Processor flow created successfully')
  } catch (error) {
    if ((error as Error).message.includes('already exists')) {
      await client.updateFlow(flow)
      console.log('PDF Processor flow updated successfully')
    } else {
      throw error
    }
  }
}
