from main import engine, Base

# This will drop all tables and recreate them (Warning: Deletes all data)
print("Resetting database...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database is now empty and ready for fresh testing.")