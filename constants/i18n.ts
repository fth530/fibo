import { useSettings } from '@/hooks/useSettings';

export type Language = 'tr' | 'en';

const strings = {
  // Home screen
  newGame: { tr: 'Yeni Oyun', en: 'New Game' },
  continueGame: { tr: 'Devam Et', en: 'Continue' },
  savedGames: { tr: 'Kayıtlı Oyunlar', en: 'Saved Games' },
  emptySlot: { tr: 'Boş Slot', en: 'Empty Slot' },
  score: { tr: 'Skor', en: 'Score' },
  best: { tr: 'En İyi', en: 'Best' },
  deleteSlot: { tr: 'Sil', en: 'Delete' },
  deleteConfirmTitle: { tr: 'Oyunu Sil', en: 'Delete Game' },
  deleteConfirmMsg: { tr: 'Bu kayıtlı oyunu silmek istediğine emin misin?', en: 'Are you sure you want to delete this saved game?' },
  cancel: { tr: 'İptal', en: 'Cancel' },
  yes: { tr: 'Evet', en: 'Yes' },
  delete: { tr: 'Sil', en: 'Delete' },
  noSavedGames: { tr: 'Henüz kayıtlı oyun yok', en: 'No saved games yet' },

  // Game screen
  subtitle: { tr: 'ardışık sayıları birleştir', en: 'merge consecutive numbers' },
  scoreLabel: { tr: 'SKOR', en: 'SCORE' },
  bestLabel: { tr: 'EN İYİ', en: 'BEST' },
  undoLabel: { tr: 'Geri al', en: 'Undo' },
  howToPlayLabel: { tr: 'Nasıl oynanır', en: 'How to play' },
  settingsLabel: { tr: 'Ayarlar', en: 'Settings' },
  newGameLabel: { tr: 'Yeni oyun', en: 'New game' },
  restartConfirmTitle: { tr: 'Yeni Oyun', en: 'New Game' },
  restartConfirmMsg: { tr: 'Mevcut oyunu bitirmek istediğine emin misin?', en: 'Are you sure you want to end the current game?' },
  saveAndExit: { tr: 'Kaydet ve Çık', en: 'Save & Exit' },
  exitConfirmTitle: { tr: 'Çıkış', en: 'Exit' },
  exitConfirmMsg: { tr: 'Oyunu kaydetmeden çıkmak istediğine emin misin?', en: 'Exit without saving?' },
  save: { tr: 'Kaydet', en: 'Save' },
  dontSave: { tr: 'Kaydetme', en: "Don't Save" },
  gameSaved: { tr: 'Oyun kaydedildi', en: 'Game saved' },

  // Game over
  gameOver: { tr: 'oyun bitti', en: 'game over' },
  totalScore: { tr: 'TOPLAM SKOR', en: 'FINAL SCORE' },
  newRecord: { tr: 'Yeni Rekor!', en: 'New Best!' },
  bestScore: { tr: 'En İyi', en: 'Best' },
  playAgain: { tr: 'Tekrar Oyna', en: 'Play Again' },
  backToMenu: { tr: 'Ana Menü', en: 'Main Menu' },
  highestTile: { tr: 'En Yüksek', en: 'Highest' },
  moves: { tr: 'Hamle', en: 'Moves' },
  time: { tr: 'Süre', en: 'Time' },

  // How to play
  howToPlayTitle: { tr: 'nasıl oynanır', en: 'how to play' },
  rule1: { tr: 'Kaydırarak tüm taşları o yöne hareket ettir.', en: 'Swipe to slide all tiles in that direction.' },
  rule2prefix: { tr: 'İki taş yalnızca ', en: 'Two tiles merge only when they are ' },
  rule2bold: { tr: 'ardışık Fibonacci sayıları', en: 'consecutive Fibonacci numbers' },
  rule2suffix: { tr: ' olduğunda birleşir.', en: '.' },
  onlyException: { tr: 'Tek istisna', en: 'Only exception' },
  goalText: { tr: 'Mümkün olan en yüksek sayıya ulaş. İyi şanslar!', en: 'Build the highest number possible. Good luck!' },
  gotIt: { tr: 'Anladım', en: 'Got it' },

  // Settings
  settingsTitle: { tr: 'ayarlar', en: 'settings' },
  hapticFeedback: { tr: 'Titreşim', en: 'Haptic Feedback' },
  darkMode: { tr: 'Karanlık Mod', en: 'Dark Mode' },
  language: { tr: 'Dil', en: 'Language' },
  turkish: { tr: 'Türkçe', en: 'Turkish' },
  english: { tr: 'İngilizce', en: 'English' },
  statistics: { tr: 'İSTATİSTİKLER', en: 'STATISTICS' },
  gamesPlayed: { tr: 'Oynanan', en: 'Played' },
  highestTileStat: { tr: 'En Yüksek Taş', en: 'Highest Tile' },
  avgScore: { tr: 'Ort. Skor', en: 'Avg. Score' },
  resetData: { tr: 'Verileri Sıfırla', en: 'Reset Data' },
  resetConfirmTitle: { tr: 'Verileri Sıfırla', en: 'Reset Data' },
  resetConfirmMsg: { tr: 'Tüm istatistikler ve en iyi skor sıfırlanacak. Bu işlem geri alınamaz.', en: 'All statistics and best score will be reset. This cannot be undone.' },
  reset: { tr: 'Sıfırla', en: 'Reset' },
  done: { tr: 'Tamam', en: 'Done' },

  // Onboarding
  welcome: { tr: 'Hoş Geldin!', en: 'Welcome!' },
  onboardingDesc: { tr: 'Ardışık Fibonacci sayılarını birleştirerek en yüksek sayıya ulaşmaya çalış.', en: 'Merge consecutive Fibonacci numbers to reach the highest number possible.' },
  selectLanguage: { tr: 'Dil Seçin', en: 'Select Language' },
  startPlaying: { tr: 'Oynamaya Başla', en: 'Start Playing' },

  // Error
  errorTitle: { tr: 'Bir hata oluştu', en: 'Something went wrong' },
  errorMsg: { tr: 'Devam etmek için uygulamayı yeniden başlatın.', en: 'Please reload the app to continue.' },
  tryAgain: { tr: 'Tekrar Dene', en: 'Try Again' },
  errorDetails: { tr: 'Hata Detayları', en: 'Error Details' },
  notFound: { tr: 'Bu sayfa bulunamadı.', en: "This screen doesn't exist." },
  goHome: { tr: 'Ana sayfaya dön', en: 'Go to home screen' },
  back: { tr: 'Geri', en: 'Back' },
} as const;

export type StringKey = keyof typeof strings;

export function getStrings(lang: Language) {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(strings)) {
    result[key] = val[lang];
  }
  return result as Record<StringKey, string>;
}

export function useT() {
  const { settings } = useSettings();
  return getStrings(settings.language ?? 'tr');
}
