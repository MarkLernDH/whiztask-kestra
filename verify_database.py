import os
from supabase import create_client, Client
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verify_database_connection():
    """
    Verify Supabase database connection and table structure
    """
    # Load environment variables from .env.local file
    env_path = os.path.join(os.path.dirname(__file__), '.env.local')
    load_dotenv(dotenv_path=env_path)

    # Initialize Supabase client
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase URL or Service Key not set in environment variables")
        return
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Detailed table information
        tables_to_check = ['users', 'automations', 'user_automations', 'user_credentials', 'usage_metrics', 'billing_customers', 'subscriptions']
        
        for table in tables_to_check:
            try:
                response = supabase.table(table).select("*").limit(1).execute()
                logger.info(f"{table.capitalize()} table exists. Rows: {len(response.data)}")
            except Exception as e:
                logger.warning(f"Could not query {table} table: {e}")
        
    except Exception as e:
        logger.error(f"Error connecting to Supabase: {e}")

if __name__ == '__main__':
    verify_database_connection()
