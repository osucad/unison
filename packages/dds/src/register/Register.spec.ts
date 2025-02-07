import { expect, it, vi } from "vitest";
import { IRegisterSetMessage, Register } from './Register.js'

describe('Register', () => {
  it("Handles set message", () => {
    const register = new Register(0)

    const op: IRegisterSetMessage = {
      type: 'set',
      value: 2
    }

    register.handle({
      type: '',
      sequenceNumber: 0,
      contents: op,
    }, false, undefined)

    expect(register.value).toBe(2)
  })

  it("Ignores set messages while in pending state", () => {
    const register = new Register(0)

    const spy = vi.spyOn(register, 'submitLocalOp')

    register.value = 1

    expect(spy).toHaveBeenCalledOnce()

    const op: IRegisterSetMessage = {
      type: 'set',
      value: 2
    }

    register.handle({
      type: '',
      sequenceNumber: 0,
      contents: op,
    }, false, undefined)

    // incoming op ignored
    expect(register.value).toBe(1)

    register.handle({
      type: '',
      sequenceNumber: 0,
      contents: spy.mock.lastCall![0]
    }, true, spy.mock.lastCall![2])

    register.handle({
      type: '',
      sequenceNumber: 0,
      contents: op,
    }, false, undefined)

    // incoming op no longer ignored
    expect(register.value).toBe(2)
  })
});