export function normalizeVector(values: number[]) {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('유효하지 않은 Embedding 벡터입니다.');
  }

  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!norm) throw new Error('Embedding 벡터의 크기가 0입니다.');
  return values.map((value) => value / norm);
}

export function toVectorLiteral(values: number[]) {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('pgvector로 변환할 수 없는 벡터입니다.');
  }
  return `[${values.join(',')}]`;
}

export function parseVector(value: string) {
  const parsed = value
    .trim()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .filter(Boolean)
    .map(Number);

  if (!parsed.length || parsed.some((item) => !Number.isFinite(item))) {
    throw new Error('DB의 pgvector 값을 해석할 수 없습니다.');
  }
  return parsed;
}
