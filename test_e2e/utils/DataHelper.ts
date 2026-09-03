export class DataHelper {
  static generateArticleName(): string {
    return `ART-TEST-${Date.now()}`;
  }

  static generateSKU(): string {
    const seg1 = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const seg2 = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const seg3 = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `${seg1}.${seg2}.${seg3}`;
  }

  static generatePrice(): string {
    return (Math.floor(Math.random() * 99000) + 1000).toFixed(2);
  }

  static generateStock(): string {
    return String(Math.floor(Math.random() * 500) + 1);
  }

  static generateClientName(): string {
    return `CLI-TEST-${Date.now()}`;
  }

  static generateCUIT(): string {
    const body = String(Math.floor(Math.random() * 90000000) + 10000000);
    const checkDigit = Math.floor(Math.random() * 10);
    return `30-${body}-${checkDigit}`;
  }

  static generateEmail(): string {
    return `test.client.${Date.now()}@automation.test`;
  }

  static generateContact(): string {
    return `test.client.${Date.now()}`;
  }

  static generatePhone(): string {
    const number = String(Math.floor(Math.random() * 90000000) + 10000000);
    return `11-${number.substring(0, 4)}-${number.substring(4)}`;
  }
}
