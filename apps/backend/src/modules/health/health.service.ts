import { Injectable } from "@nestjs/common";

import { HealthResponse } from "./types";

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      time: new Date().toISOString()
    };
  }
}
