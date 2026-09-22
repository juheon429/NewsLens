import { BadRequestException } from '@nestjs/common';

const CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;

export function parseClientId(value: unknown) {
  if (typeof value !== 'string' || !CLIENT_ID_PATTERN.test(value.trim())) {
    throw new BadRequestException('유효한 기기 식별자가 필요합니다.');
  }
  return value.trim();
}

export function parseChatMessage(value: unknown) {
  if (typeof value !== 'string') {
    throw new BadRequestException('메시지를 입력해 주세요.');
  }
  const message = value.trim();
  if (!message) throw new BadRequestException('메시지를 입력해 주세요.');
  if (message.length > 1000) {
    throw new BadRequestException('메시지는 1,000자 이하로 입력해 주세요.');
  }
  return message;
}
