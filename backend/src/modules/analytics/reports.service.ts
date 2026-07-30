export class ReportsService {
  async generateReport(input: any): Promise<any> {
    return {
      id: `report_${Date.now()}`,
      name: input.name,
      type: input.type,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      downloadUrl: null,
    }
  }

  async listReports(): Promise<any[]> {
    return []
  }
}

export const reportsService = new ReportsService()
