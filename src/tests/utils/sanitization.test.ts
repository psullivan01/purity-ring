import sanitization from '../../utils/sanitization';

describe('Sanitization', () => {
  describe('removeSpecialCharacters', () => {
    it('should remove all special characters except alphabetic characters', () => {
      const input = 'Hello! How are you?';
      const expected = 'HelloHowareyou';
      const result = sanitization.removeSpecialCharacters(input);
      expect(result).toBe(expected);
    });

    it('should return an empty string when there are no alphabetic characters', () => {
      const input = '12345!@#$%';
      const expected = '';
      const result = sanitization.removeSpecialCharacters(input);
      expect(result).toBe(expected);
    });
  });

  describe('processString', () => {
    it('should replace leet characters with their alphabetic equivalents', () => {
      const input = 'h3ll0 w0rld!';
      const expected = 'helloworldi';
      const result = sanitization.processString(input);
      expect(result).toBe(expected);
    });

    it('should handle mixed leet characters and special characters', () => {
      const input = '@bcd3fgh!jklmn0pqrs7uvwxy2';
      const expected = 'abcdefghijklmnopqrstuvwxyz';
      const result = sanitization.processString(input);
      expect(result).toBe(expected);
    });

    it('should return the same string if no leet characters are present', () => {
      const input = 'hello world';
      const result = sanitization.processString(input);
      expect(result).toBe('helloworld');
    });
  });

  describe('sanitize', () => {
    it('should sanitize the string with leet character mapping enabled', () => {
      const input = '7h3 qu1ck br0wn f0x';
      const expected = 'thequickbrownfox';
      const result = sanitization.sanitize(input, true);
      expect(result).toBe(expected);
    });

    it('should sanitize the string without leet character mapping', () => {
      const input = '7h3 qu1ck br0wn f0x';
      const expected = 'hquckbrwnfx';
      const result = sanitization.sanitize(input, false);
      expect(result).toBe(expected);
    });

    it('should convert the string to lowercase during sanitization', () => {
      const input = 'HELLO WORLD';
      const expected = 'helloworld';
      const result = sanitization.sanitize(input, false);
      expect(result).toBe(expected);
    });

    it('should return an empty string when input contains no alphabetic characters without character mapping', () => {
      const input = '1234567890!@#$%^&*()';
      const expected = '';
      const result = sanitization.sanitize(input, false);
      expect(result).toBe(expected);
    });
  });
});
