import * as bcrypt from 'bcrypt';

export async function comparePassword(plainPassword: string, hash: string) {
  return await bcrypt.compare(plainPassword, hash);
}
