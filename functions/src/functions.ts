import * as f from "firebase-functions"

export const functions = f.region(f.config().functions?.region ?? "us-central1")
