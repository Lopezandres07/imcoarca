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
    // 1. Prefijos válidos en Argentina (20, 23, 27 para personas; 30, 33, 34 para empresas)
    const prefixes = [20, 23, 27, 30, 33, 34];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    // 2. Número de documento o base aleatorio de 8 dígitos (entre 10000000 y 99999999)
    const body = Math.floor(Math.random() * 89999999 + 10000000).toString();

    const cuitBase = `${prefix}${body}`;

    // 3. Cálculo oficial del dígito verificador (Módulo 11)
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuitBase[i], 10) * multipliers[i];
    }

    let verificador = 11 - (suma % 11);
    if (verificador === 11) verificador = 0;
    if (verificador === 10) {
      // Si el verificador da 10, la regla AFIP exige cambiar el prefijo o reintentar. 
      // Para simplificar, llamamos de nuevo a la función recursivamente:
      return this.generateCUIT();
    }

    // 4. Retornamos el CUIT completo (puedes ajustarlo con guiones si tu input lo requiere: `${prefix}-${body}-${verificador}`)
    return `${cuitBase}${verificador}`;
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
