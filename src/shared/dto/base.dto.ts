export class ResponseDTO {
  public data: any;
  public msgSts: { code: string; message: string; codes?: Array<string> };
  constructor(data: {
    data: any;
    msgSts: { code: string; message: string; codes?: Array<string> };
  }) {
    this.data = data.data;
    this.msgSts = data.msgSts;
  }
}
