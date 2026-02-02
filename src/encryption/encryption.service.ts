import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

/**
 * This service is used to encrypt and decrypt desired string data.
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm: string;
  private readonly key: string;

  constructor(private _configService: ConfigService) {
    this.algorithm = this._configService.get<string>('ENCRYPTION_ALGORITHM')!;
    this.key = this._configService.get<string>('ENCRYPTION_KEY')!;
  }

  /**
   * This method is used to encrypt desired string and return encrypted version
   * of that string.
   *
   * @param stringToEncrypt - Desired string to encrypt
   * @returns Encrypted string
   */
  encrypt(stringToEncrypt: string): string {
    const iv = randomBytes(16); // Generate a random IV for every encryption
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(stringToEncrypt, 'utf8'),
      cipher.final(),
    ]);

    // Return IV + Encrypted Data as a single hex string
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * This method is used to decrypt ecnrypted string and return decrypted version
   * of that string.
   *
   * @param stringToDecrypt - Desired string to decrypt
   * @returns Decrypted string.
   */
  decrypt(stringToDecrypt: string): string {
    const [ivHex, dataHex] = stringToDecrypt.split(':'); // Split IV and data
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(dataHex, 'hex');

    const decipher = createDecipheriv(this.algorithm, this.key, iv);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
