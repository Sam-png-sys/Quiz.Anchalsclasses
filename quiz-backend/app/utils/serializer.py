def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc