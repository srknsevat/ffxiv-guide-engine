import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("should return ok", async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController]
    }).compile();
    const controller = moduleRef.get(HealthController);
    const actual = controller.getHealth();
    expect(actual.status).toBe("ok");
  });
});
