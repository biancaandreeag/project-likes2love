from database.database import posts_collection
from shared_utils.logger_config  import log
from kafka import KafkaConsumer
from datetime import datetime, timezone
import json
import time
import os

class KafkaConsumerClient:
    def __init__(self, kafka_server: str = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'broker:29092'),
                 topic: str = 'test_topic', group_id: str = 'test_group'):
        self.kafka_server = kafka_server
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self.init_consumer()

    def init_consumer(self):
        retries = 5
        while retries > 0:
            try:
                log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connected on topic '{self.topic}'... ]")
                self.consumer = KafkaConsumer(
                    self.topic,
                    bootstrap_servers=self.kafka_server,
                    group_id=self.group_id,
                    enable_auto_commit=True,
                    heartbeat_interval_ms=10000,
                    session_timeout_ms=10000,
                    auto_offset_reset='earliest',
                    max_poll_interval_ms=300000,
                    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                    key_deserializer=lambda k: k.decode('utf-8') if k else None
                )
                break
            except Exception as e:
                log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Connection error: {str(e)} ]")
                retries -= 1
                if retries > 0:
                    time.sleep(5)
                else:
                    log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Failed to connect after several retries. ]")

    def listen(self):
        if self.consumer:
            log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ Listening on topic '{self.topic}'... ]")
            for message in self.consumer:
                yield message
        else:
            log.error(f"[ KAFKA CONSUMER - '{self.topic}' ][ Not initialized. ]")

    def consume(self, message):
        log.info(f"[ KAFKA CONSUMER - '{self.topic}' ][ New message received. Key: {message.key} ]")
        #log.info(f"| Value: {message.value}")
        data=message.value

        if data.get("type") == "general_analysis":
            uuid = message.key
            result_data = {k: v for k, v in data.items() if k not in ("type", "post_link")}

            analysis_entry = {
                "type": "general_analysis",
                "result": result_data
            }

            try:
                update_result = posts_collection.update_one(
                    {"uuid": uuid},
                    {"$push": {"analyses": analysis_entry}}
                )

                if update_result.matched_count == 0:
                    log.warning(f"[ DATABASE ][ No post found with UUID: {uuid} ]")
                else:
                    log.info(f"[ DATABASE ][ Analysis added to post {uuid} ]")

            except Exception as e:
                log.error(f"[ DATABASE ][ Error updating post with UUID {uuid}: {str(e)} ]")

        elif isinstance(data, dict):
            try:
                if "post_name" not in data:
                    data["post_name"] = data["post_link"]
                data["analysis_date"] = datetime.now(timezone.utc).isoformat()
                result = posts_collection.insert_one(data)
                log.info(f"[ DATABASE ][ Inserted post with ID: {result.inserted_id} ]")
                
            except Exception as e:
                log.error(f"[ DATABASE ][ Error inserting post: {str(e)} ]")
        else:
            log.warning(f"[ DATABASE ][ Message value is not a proper post: {data} ]")

        



       
