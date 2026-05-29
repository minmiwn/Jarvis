from dotenv import load_dotenv
from mem0 import MemoryClient
import logging
import json


load_dotenv(".env")
user_name = 'Minh'
mem0 = MemoryClient()

def add_memory():
    
    messages_formatted = [
        {        "role": "user",
            "content": "I really like Linkin Park."
        },
        {
            "role": "assistant",
            "content": "That is a good choice."
        },
        {
            "role": "user",
            "content": "I think so too."
        },
        {
            "role": "assistant",
            "content": "What is your favorite song by them?"
        },
    ]

    mem0.add(messages_formatted, user_id="Minh")

def get_memory_by_query():
    mem0 = MemoryClient()
    query = f"What are {user_name}'s preferences?"
    response = mem0.search(query, filters={"user_id": user_name})
    results = response.get("results", [])

    memories = [
            {
                "memory": result["memory"],
                "updated_at": result["updated_at"]
            }
            for result in results
        ]
    memories_str = json.dumps(memories)
    print(f"Memories: {memories_str}")
    return memories_str


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # add_memory()
    get_memory_by_query()