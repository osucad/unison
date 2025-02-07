import { expect, it } from "vitest";
import { IRegisterSetMessage, Register } from './Register.js'

describe('Register', () => {
  it("Handles set message", () => {
    const register = new Register(0)

    const op: IRegisterSetMessage = {
      type: 'set',
      value: 2
    }

    register.handle({
      type: '' ,
      sequenceNumber: 0,
      contents: op,
    }, true)

    expect(register.value).toBe(2)
  })
});