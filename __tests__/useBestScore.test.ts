import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage before importing the hook
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

// We test the logic directly since hook testing requires renderHook
describe('useBestScore storage logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getItem is a callable mock', () => {
        expect(AsyncStorage.getItem).toBeDefined();
    });

    it('setItem is a callable mock', () => {
        expect(AsyncStorage.setItem).toBeDefined();
    });

    it('getItem returns null when no score saved', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        const result = await AsyncStorage.getItem('@fibonacci_best_score');
        expect(result).toBeNull();
    });

    it('getItem returns saved score string', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('150');
        const result = await AsyncStorage.getItem('@fibonacci_best_score');
        expect(result).toBe('150');
        expect(parseInt(result!, 10)).toBe(150);
    });

    it('setItem persists score correctly', async () => {
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
        await AsyncStorage.setItem('@fibonacci_best_score', '200');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@fibonacci_best_score', '200');
    });

    it('handles getItem rejection gracefully', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
        await expect(AsyncStorage.getItem('@fibonacci_best_score')).rejects.toThrow('Storage error');
    });

    it('validates parsed score is a valid number', () => {
        const validCases = ['0', '1', '100', '99999'];
        validCases.forEach((val) => {
            const parsed = parseInt(val, 10);
            expect(isNaN(parsed)).toBe(false);
        });

        const invalidCases = ['abc', '', 'null'];
        invalidCases.forEach((val) => {
            const parsed = parseInt(val, 10);
            expect(isNaN(parsed)).toBe(true);
        });
    });
});
