import {
  ValidationError,
  mapTaskRow,
  parsePositiveId,
  validateCreateTask,
  validateUpdateTask,
} from '../../src/services/taskValidation';

describe('taskValidation (Unit Tests)', () => {
  describe('validateCreateTask', () => {
    it('should trim valid title and description', () => {
      const result = validateCreateTask({
        title: '  Configurar CI  ',
        description: '  Criar workflow no GitHub Actions  ',
      });

      expect(result).toEqual({
        title: 'Configurar CI',
        description: 'Criar workflow no GitHub Actions',
      });
    });

    it('should default description to empty string when omitted', () => {
      const result = validateCreateTask({ title: 'Estudar Docker' });
      expect(result).toEqual({ title: 'Estudar Docker', description: '' });
    });

    it('should throw ValidationError when title is shorter than 3 chars', () => {
      expect(() => validateCreateTask({ title: 'ab' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when body is not an object', () => {
      expect(() => validateCreateTask(null)).toThrow(ValidationError);
    });
  });

  describe('validateUpdateTask', () => {
    it('should validate partial update fields', () => {
      const result = validateUpdateTask({ completed: true, title: '  Atualizado  ' });
      expect(result).toEqual({ completed: true, title: 'Atualizado' });
    });

    it('should throw ValidationError when no valid fields are provided', () => {
      expect(() => validateUpdateTask({})).toThrow(ValidationError);
    });

    it('should throw ValidationError when completed is not boolean', () => {
      expect(() => validateUpdateTask({ completed: 'yes' })).toThrow(ValidationError);
    });
  });

  describe('parsePositiveId', () => {
    it('should parse valid positive integer string', () => {
      expect(parsePositiveId('42')).toBe(42);
    });

    it('should reject zero, negative, or non-integer strings', () => {
      expect(() => parsePositiveId('0')).toThrow(ValidationError);
      expect(() => parsePositiveId('-3')).toThrow(ValidationError);
      expect(() => parsePositiveId('abc')).toThrow(ValidationError);
    });
  });

  describe('mapTaskRow', () => {
    it('should convert SQLite integer completed flag to boolean', () => {
      const mapped = mapTaskRow({
        id: 1,
        title: 'Test',
        description: 'Desc',
        completed: 1,
        created_at: '2026-11-13 22:00:00',
      });

      expect(mapped).toEqual({
        id: 1,
        title: 'Test',
        description: 'Desc',
        completed: true,
        createdAt: '2026-11-13 22:00:00',
      });
    });
  });
});
