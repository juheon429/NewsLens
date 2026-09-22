import { BadRequestException } from '@nestjs/common';

import { parseChatMessage, parseClientId } from './chat.validation';

describe('chat validation', () => {
  it('기기 식별자와 메시지의 앞뒤 공백을 제거한다', () => {
    expect(parseClientId('  device_1234567890  ')).toBe('device_1234567890');
    expect(parseChatMessage('  핵심 쟁점이 뭐야?  ')).toBe('핵심 쟁점이 뭐야?');
  });

  it('짧거나 허용되지 않은 기기 식별자를 거부한다', () => {
    expect(() => parseClientId('short')).toThrow(BadRequestException);
    expect(() => parseClientId('device id with spaces')).toThrow(BadRequestException);
  });

  it('빈 메시지와 1,000자를 초과한 메시지를 거부한다', () => {
    expect(() => parseChatMessage('   ')).toThrow(BadRequestException);
    expect(() => parseChatMessage('가'.repeat(1001))).toThrow(BadRequestException);
  });
});
