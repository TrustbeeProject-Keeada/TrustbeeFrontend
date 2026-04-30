import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, type CvGenerationPayload } from "@/lib/api";

const API_BASE = "http://localhost:4000/api";

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api endpoint wiring", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("uses /applications/job/:jobId for applyToJob", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockJsonResponse({
        status: "success",
        data: { id: 1, jobSeekerId: 2, jobId: 123, status: "PENDING" },
      }),
    );

    await api.applyToJob(123);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/applications/job/123`);
    expect((options as RequestInit).method).toBe("POST");
  });

  it("uses /applications/job/:jobId for getJobApplications", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockJsonResponse({ status: "success", data: [] }));

    await api.getJobApplications(7);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/applications/job/7`);
    expect((options as RequestInit).method).toBeUndefined();
  });

  it("sends CV form data to POST /generate-cv-pdf/:jobseekerId", async () => {
    const payload: CvGenerationPayload = {
      personal: {
        firstName: "Alice",
        lastName: "Doe",
        email: "alice@example.com",
        phone: "+4600000000",
        address: "Main Street 1",
        postalCode: "11122",
        city: "Stockholm",
        photo: "data:image/png;base64,abc",
      },
      summary: "Frontend engineer",
      skills: ["React", "TypeScript"],
      experience: [
        {
          id: "exp_1",
          company: "Trustbee",
          role: "Frontend Dev",
          startDate: "2024-01",
          endDate: "2025-01",
          description: "Built UI features",
        },
      ],
      education: [
        {
          id: "edu_1",
          school: "KTH",
          degree: "Computer Science",
          startDate: "2020-09",
          endDate: "2023-06",
          description: "Bachelor program",
        },
      ],
      languages: ["English"],
      interests: "Reading",
      references: "Available upon request",
      pendingInputs: {
        skill: "Node.js",
        language: "Swedish",
      },
      formSnapshot: {
        personal: {
          firstName: "Alice",
          lastName: "Doe",
          email: "alice@example.com",
          phone: "+4600000000",
          address: "Main Street 1",
          postalCode: "11122",
          city: "Stockholm",
          photo: "data:image/png;base64,abc",
        },
        summary: "Frontend engineer",
        experience: [
          {
            id: "exp_1",
            company: "Trustbee",
            role: "Frontend Dev",
            startDate: "2024-01",
            endDate: "2025-01",
            description: "Built UI features",
          },
        ],
        education: [
          {
            id: "edu_1",
            school: "KTH",
            degree: "Computer Science",
            startDate: "2020-09",
            endDate: "2023-06",
            description: "Bachelor program",
          },
        ],
        skills: ["React", "TypeScript"],
        languages: ["English"],
        interests: "Reading",
        references: "Available upon request",
      },
      meta: {
        source: "cv-builder",
        submittedAt: "2026-04-22T00:00:00.000Z",
        schemaVersion: 1,
        currentStep: "template",
      },
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      mockJsonResponse({
        status: "success",
        data: { success: true, jobSeekerId: 55, message: "saved" },
      }),
    );

    await api.generateCvPdf(55, payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE}/generate-cv-pdf/55`);
    expect((options as RequestInit).method).toBe("POST");
    expect((options as RequestInit).body).toBe(JSON.stringify(payload));
  });
});
