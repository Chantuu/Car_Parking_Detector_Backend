import * as bcrypt from 'bcrypt';

export async function hashPassword(passwordToHash: string): Promise<string> {
  return await bcrypt.hash(passwordToHash, 10);
}
