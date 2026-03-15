import { useSettings } from '@/hooks/useSettings';

export type Language = 'tr' | 'en' | 'ja' | 'de' | 'ko' | 'fr' | 'pt' | 'es';

export const LANGUAGE_LABELS: Record<Language, string> = {
  tr: 'Türkçe',
  en: 'English',
  ja: '日本語',
  de: 'Deutsch',
  ko: '한국어',
  fr: 'Français',
  pt: 'Português',
  es: 'Español',
};

const strings = {
  // Home screen
  newGame: { tr: 'Yeni Oyun', en: 'New Game', ja: '新しいゲーム', de: 'Neues Spiel', ko: '새 게임', fr: 'Nouvelle Partie', pt: 'Novo Jogo', es: 'Nuevo Juego' },
  continueGame: { tr: 'Devam Et', en: 'Continue', ja: '続ける', de: 'Fortsetzen', ko: '계속하기', fr: 'Continuer', pt: 'Continuar', es: 'Continuar' },
  savedGames: { tr: 'Kayıtlı Oyunlar', en: 'Saved Games', ja: 'セーブデータ', de: 'Gespeicherte Spiele', ko: '저장된 게임', fr: 'Parties Sauvegardées', pt: 'Jogos Salvos', es: 'Juegos Guardados' },
  emptySlot: { tr: 'Boş Slot', en: 'Empty Slot', ja: '空きスロット', de: 'Leerer Slot', ko: '빈 슬롯', fr: 'Emplacement Vide', pt: 'Slot Vazio', es: 'Ranura Vacía' },
  score: { tr: 'Skor', en: 'Score', ja: 'スコア', de: 'Punkte', ko: '점수', fr: 'Score', pt: 'Pontos', es: 'Puntos' },
  best: { tr: 'En İyi', en: 'Best', ja: 'ベスト', de: 'Beste', ko: '최고', fr: 'Meilleur', pt: 'Melhor', es: 'Mejor' },
  deleteSlot: { tr: 'Sil', en: 'Delete', ja: '削除', de: 'Löschen', ko: '삭제', fr: 'Supprimer', pt: 'Excluir', es: 'Eliminar' },
  deleteConfirmTitle: { tr: 'Oyunu Sil', en: 'Delete Game', ja: 'ゲームを削除', de: 'Spiel löschen', ko: '게임 삭제', fr: 'Supprimer la Partie', pt: 'Excluir Jogo', es: 'Eliminar Juego' },
  deleteConfirmMsg: { tr: 'Bu kayıtlı oyunu silmek istediğine emin misin?', en: 'Are you sure you want to delete this saved game?', ja: 'このセーブデータを削除しますか？', de: 'Möchtest du dieses gespeicherte Spiel wirklich löschen?', ko: '이 저장된 게임을 삭제하시겠습니까?', fr: 'Voulez-vous vraiment supprimer cette partie ?', pt: 'Tem certeza de que deseja excluir este jogo salvo?', es: '¿Estás seguro de que quieres eliminar este juego guardado?' },
  cancel: { tr: 'İptal', en: 'Cancel', ja: 'キャンセル', de: 'Abbrechen', ko: '취소', fr: 'Annuler', pt: 'Cancelar', es: 'Cancelar' },
  yes: { tr: 'Evet', en: 'Yes', ja: 'はい', de: 'Ja', ko: '예', fr: 'Oui', pt: 'Sim', es: 'Sí' },
  delete: { tr: 'Sil', en: 'Delete', ja: '削除', de: 'Löschen', ko: '삭제', fr: 'Supprimer', pt: 'Excluir', es: 'Eliminar' },
  noSavedGames: { tr: 'Henüz kayıtlı oyun yok', en: 'No saved games yet', ja: 'セーブデータはまだありません', de: 'Noch keine gespeicherten Spiele', ko: '아직 저장된 게임이 없습니다', fr: 'Aucune partie sauvegardée', pt: 'Nenhum jogo salvo ainda', es: 'Aún no hay juegos guardados' },

  // Game screen
  subtitle: { tr: 'ardışık sayıları birleştir', en: 'merge consecutive numbers', ja: '連続する数を合体させよう', de: 'verbinde aufeinanderfolgende Zahlen', ko: '연속된 숫자를 합치세요', fr: 'fusionnez les nombres consécutifs', pt: 'mescle números consecutivos', es: 'fusiona números consecutivos' },
  scoreLabel: { tr: 'SKOR', en: 'SCORE', ja: 'スコア', de: 'PUNKTE', ko: '점수', fr: 'SCORE', pt: 'PONTOS', es: 'PUNTOS' },
  bestLabel: { tr: 'EN İYİ', en: 'BEST', ja: 'ベスト', de: 'BESTE', ko: '최고', fr: 'RECORD', pt: 'MELHOR', es: 'MEJOR' },
  undoLabel: { tr: 'Geri al', en: 'Undo', ja: '元に戻す', de: 'Rückgängig', ko: '되돌리기', fr: 'Annuler', pt: 'Desfazer', es: 'Deshacer' },
  howToPlayLabel: { tr: 'Nasıl oynanır', en: 'How to play', ja: '遊び方', de: 'Spielanleitung', ko: '게임 방법', fr: 'Comment jouer', pt: 'Como jogar', es: 'Cómo jugar' },
  settingsLabel: { tr: 'Ayarlar', en: 'Settings', ja: '設定', de: 'Einstellungen', ko: '설정', fr: 'Paramètres', pt: 'Configurações', es: 'Ajustes' },
  newGameLabel: { tr: 'Yeni oyun', en: 'New game', ja: '新規ゲーム', de: 'Neues Spiel', ko: '새 게임', fr: 'Nouvelle partie', pt: 'Novo jogo', es: 'Nuevo juego' },
  restartConfirmTitle: { tr: 'Yeni Oyun', en: 'New Game', ja: '新しいゲーム', de: 'Neues Spiel', ko: '새 게임', fr: 'Nouvelle Partie', pt: 'Novo Jogo', es: 'Nuevo Juego' },
  restartConfirmMsg: { tr: 'Mevcut oyunu bitirmek istediğine emin misin?', en: 'Are you sure you want to end the current game?', ja: '現在のゲームを終了しますか？', de: 'Möchtest du das aktuelle Spiel wirklich beenden?', ko: '현재 게임을 종료하시겠습니까?', fr: 'Voulez-vous vraiment terminer la partie en cours ?', pt: 'Tem certeza de que deseja encerrar o jogo atual?', es: '¿Estás seguro de que quieres terminar el juego actual?' },
  saveAndExit: { tr: 'Kaydet ve Çık', en: 'Save & Exit', ja: '保存して終了', de: 'Speichern & Beenden', ko: '저장 후 나가기', fr: 'Sauvegarder & Quitter', pt: 'Salvar & Sair', es: 'Guardar & Salir' },
  exitConfirmTitle: { tr: 'Çıkış', en: 'Exit', ja: '終了', de: 'Beenden', ko: '나가기', fr: 'Quitter', pt: 'Sair', es: 'Salir' },
  exitConfirmMsg: { tr: 'Oyunu kaydetmeden çıkmak istediğine emin misin?', en: 'Exit without saving?', ja: '保存せずに終了しますか？', de: 'Ohne Speichern beenden?', ko: '저장하지 않고 나가시겠습니까?', fr: 'Quitter sans sauvegarder ?', pt: 'Sair sem salvar?', es: '¿Salir sin guardar?' },
  save: { tr: 'Kaydet', en: 'Save', ja: '保存', de: 'Speichern', ko: '저장', fr: 'Sauvegarder', pt: 'Salvar', es: 'Guardar' },
  dontSave: { tr: 'Kaydetme', en: "Don't Save", ja: '保存しない', de: 'Nicht speichern', ko: '저장 안 함', fr: 'Ne pas sauvegarder', pt: 'Não salvar', es: 'No guardar' },
  gameSaved: { tr: 'Oyun kaydedildi', en: 'Game saved', ja: 'ゲームを保存しました', de: 'Spiel gespeichert', ko: '게임이 저장되었습니다', fr: 'Partie sauvegardée', pt: 'Jogo salvo', es: 'Juego guardado' },

  // Game over
  gameOver: { tr: 'oyun bitti', en: 'game over', ja: 'ゲームオーバー', de: 'Spiel vorbei', ko: '게임 오버', fr: 'partie terminée', pt: 'fim de jogo', es: 'fin del juego' },
  totalScore: { tr: 'TOPLAM SKOR', en: 'FINAL SCORE', ja: '最終スコア', de: 'ENDERGEBNIS', ko: '최종 점수', fr: 'SCORE FINAL', pt: 'PONTUAÇÃO FINAL', es: 'PUNTUACIÓN FINAL' },
  newRecord: { tr: 'Yeni Rekor!', en: 'New Best!', ja: '新記録！', de: 'Neuer Rekord!', ko: '새 기록!', fr: 'Nouveau Record !', pt: 'Novo Recorde!', es: '¡Nuevo Récord!' },
  bestScore: { tr: 'En İyi', en: 'Best', ja: 'ベスト', de: 'Beste', ko: '최고', fr: 'Meilleur', pt: 'Melhor', es: 'Mejor' },
  playAgain: { tr: 'Tekrar Oyna', en: 'Play Again', ja: 'もう一度', de: 'Nochmal', ko: '다시 하기', fr: 'Rejouer', pt: 'Jogar Novamente', es: 'Jugar de Nuevo' },
  backToMenu: { tr: 'Ana Menü', en: 'Main Menu', ja: 'メインメニュー', de: 'Hauptmenü', ko: '메인 메뉴', fr: 'Menu Principal', pt: 'Menu Principal', es: 'Menú Principal' },
  highestTile: { tr: 'En Yüksek', en: 'Highest', ja: '最高タイル', de: 'Höchste', ko: '최고 타일', fr: 'Plus Haut', pt: 'Maior', es: 'Más Alto' },
  moves: { tr: 'Hamle', en: 'Moves', ja: '手数', de: 'Züge', ko: '이동', fr: 'Coups', pt: 'Movimentos', es: 'Movimientos' },
  time: { tr: 'Süre', en: 'Time', ja: '時間', de: 'Zeit', ko: '시간', fr: 'Temps', pt: 'Tempo', es: 'Tiempo' },

  // How to play
  howToPlayTitle: { tr: 'nasıl oynanır', en: 'how to play', ja: '遊び方', de: 'Spielanleitung', ko: '게임 방법', fr: 'comment jouer', pt: 'como jogar', es: 'cómo jugar' },
  rule1: { tr: 'Kaydırarak tüm taşları o yöne hareket ettir.', en: 'Swipe to slide all tiles in that direction.', ja: 'スワイプしてすべてのタイルをその方向にスライドさせます。', de: 'Wische, um alle Kacheln in diese Richtung zu schieben.', ko: '스와이프하여 모든 타일을 해당 방향으로 밀어보세요.', fr: 'Glissez pour déplacer toutes les tuiles dans cette direction.', pt: 'Deslize para mover todas as peças naquela direção.', es: 'Desliza para mover todas las fichas en esa dirección.' },
  rule2prefix: { tr: 'İki taş yalnızca ', en: 'Two tiles merge only when they are ', ja: '2つのタイルは', de: 'Zwei Kacheln verschmelzen nur, wenn sie ', ko: '두 타일은 ', fr: 'Deux tuiles fusionnent uniquement quand elles sont des ', pt: 'Duas peças se fundem apenas quando são ', es: 'Dos fichas se fusionan solo cuando son ' },
  rule2bold: { tr: 'ardışık Fibonacci sayıları', en: 'consecutive Fibonacci numbers', ja: '連続するフィボナッチ数', de: 'aufeinanderfolgende Fibonacci-Zahlen', ko: '연속된 피보나치 수', fr: 'nombres de Fibonacci consécutifs', pt: 'números de Fibonacci consecutivos', es: 'números de Fibonacci consecutivos' },
  rule2suffix: { tr: ' olduğunda birleşir.', en: '.', ja: 'の場合のみ合体します。', de: ' sind.', ko: '일 때만 합쳐집니다.', fr: '.', pt: '.', es: '.' },
  onlyException: { tr: 'Tek istisna', en: 'Only exception', ja: '唯一の例外', de: 'Einzige Ausnahme', ko: '유일한 예외', fr: 'Seule exception', pt: 'Única exceção', es: 'Única excepción' },
  goalText: { tr: 'Mümkün olan en yüksek sayıya ulaş. İyi şanslar!', en: 'Build the highest number possible. Good luck!', ja: 'できるだけ高い数を目指そう。頑張って！', de: 'Erreiche die höchstmögliche Zahl. Viel Glück!', ko: '가능한 한 높은 숫자를 만들어 보세요. 행운을 빕니다!', fr: 'Atteignez le nombre le plus élevé possible. Bonne chance !', pt: 'Alcance o maior número possível. Boa sorte!', es: '¡Alcanza el número más alto posible. Buena suerte!' },
  gotIt: { tr: 'Anladım', en: 'Got it', ja: '了解', de: 'Verstanden', ko: '알겠습니다', fr: 'Compris', pt: 'Entendi', es: 'Entendido' },

  // Settings
  settingsTitle: { tr: 'ayarlar', en: 'settings', ja: '設定', de: 'Einstellungen', ko: '설정', fr: 'paramètres', pt: 'configurações', es: 'ajustes' },
  hapticFeedback: { tr: 'Titreşim', en: 'Haptic Feedback', ja: '振動フィードバック', de: 'Haptisches Feedback', ko: '진동 피드백', fr: 'Retour Haptique', pt: 'Feedback Tátil', es: 'Retroalimentación Háptica' },
  darkMode: { tr: 'Karanlık Mod', en: 'Dark Mode', ja: 'ダークモード', de: 'Dunkelmodus', ko: '다크 모드', fr: 'Mode Sombre', pt: 'Modo Escuro', es: 'Modo Oscuro' },
  language: { tr: 'Dil', en: 'Language', ja: '言語', de: 'Sprache', ko: '언어', fr: 'Langue', pt: 'Idioma', es: 'Idioma' },
  statistics: { tr: 'İSTATİSTİKLER', en: 'STATISTICS', ja: '統計', de: 'STATISTIKEN', ko: '통계', fr: 'STATISTIQUES', pt: 'ESTATÍSTICAS', es: 'ESTADÍSTICAS' },
  gamesPlayed: { tr: 'Oynanan', en: 'Played', ja: 'プレイ数', de: 'Gespielt', ko: '플레이', fr: 'Jouées', pt: 'Jogados', es: 'Jugados' },
  highestTileStat: { tr: 'En Yüksek Taş', en: 'Highest Tile', ja: '最高タイル', de: 'Höchste Kachel', ko: '최고 타일', fr: 'Plus Haute Tuile', pt: 'Maior Peça', es: 'Mayor Ficha' },
  avgScore: { tr: 'Ort. Skor', en: 'Avg. Score', ja: '平均スコア', de: 'Ø Punkte', ko: '평균 점수', fr: 'Score Moyen', pt: 'Média', es: 'Media' },
  resetData: { tr: 'Verileri Sıfırla', en: 'Reset Data', ja: 'データをリセット', de: 'Daten zurücksetzen', ko: '데이터 초기화', fr: 'Réinitialiser', pt: 'Redefinir Dados', es: 'Restablecer Datos' },
  resetConfirmTitle: { tr: 'Verileri Sıfırla', en: 'Reset Data', ja: 'データリセット', de: 'Daten zurücksetzen', ko: '데이터 초기화', fr: 'Réinitialiser', pt: 'Redefinir', es: 'Restablecer' },
  resetConfirmMsg: { tr: 'Tüm istatistikler ve en iyi skor sıfırlanacak. Bu işlem geri alınamaz.', en: 'All statistics and best score will be reset. This cannot be undone.', ja: 'すべての統計とベストスコアがリセットされます。この操作は取り消せません。', de: 'Alle Statistiken und der Highscore werden zurückgesetzt. Dies kann nicht rückgängig gemacht werden.', ko: '모든 통계와 최고 점수가 초기화됩니다. 이 작업은 되돌릴 수 없습니다.', fr: 'Toutes les statistiques et le meilleur score seront réinitialisés. Cette action est irréversible.', pt: 'Todas as estatísticas e a melhor pontuação serão redefinidas. Isso não pode ser desfeito.', es: 'Todas las estadísticas y la mejor puntuación se restablecerán. Esto no se puede deshacer.' },
  reset: { tr: 'Sıfırla', en: 'Reset', ja: 'リセット', de: 'Zurücksetzen', ko: '초기화', fr: 'Réinitialiser', pt: 'Redefinir', es: 'Restablecer' },
  done: { tr: 'Tamam', en: 'Done', ja: '完了', de: 'Fertig', ko: '완료', fr: 'Terminé', pt: 'Concluído', es: 'Listo' },

  // Onboarding
  welcome: { tr: 'Hoş Geldin!', en: 'Welcome!', ja: 'ようこそ！', de: 'Willkommen!', ko: '환영합니다!', fr: 'Bienvenue !', pt: 'Bem-vindo!', es: '¡Bienvenido!' },
  onboardingDesc: { tr: 'Ardışık Fibonacci sayılarını birleştirerek en yüksek sayıya ulaşmaya çalış.', en: 'Merge consecutive Fibonacci numbers to reach the highest number possible.', ja: '連続するフィボナッチ数を合体させて、最高の数を目指そう。', de: 'Verbinde aufeinanderfolgende Fibonacci-Zahlen, um die höchstmögliche Zahl zu erreichen.', ko: '연속된 피보나치 수를 합쳐서 가장 높은 숫자에 도달하세요.', fr: 'Fusionnez les nombres de Fibonacci consécutifs pour atteindre le nombre le plus élevé.', pt: 'Mescle números de Fibonacci consecutivos para alcançar o maior número possível.', es: 'Fusiona números de Fibonacci consecutivos para alcanzar el número más alto posible.' },
  selectLanguage: { tr: 'Dil Seçin', en: 'Select Language', ja: '言語を選択', de: 'Sprache wählen', ko: '언어 선택', fr: 'Choisir la Langue', pt: 'Selecionar Idioma', es: 'Seleccionar Idioma' },
  startPlaying: { tr: 'Oynamaya Başla', en: 'Start Playing', ja: 'ゲーム開始', de: 'Spiel starten', ko: '게임 시작', fr: 'Commencer à Jouer', pt: 'Começar a Jogar', es: 'Empezar a Jugar' },

  // Sharing
  share: { tr: 'Paylaş', en: 'Share', ja: '共有', de: 'Teilen', ko: '공유', fr: 'Partager', pt: 'Compartilhar', es: 'Compartir' },
  shareMsg: { tr: 'Fibo\'da {score} puan yaptım! En yüksek taşım: {tile}. Sen de dene!', en: 'I scored {score} in Fibo! My highest tile: {tile}. Try it!', ja: 'Fiboで{score}点を獲得！最高タイル: {tile}。やってみて！', de: 'Ich habe {score} Punkte in Fibo erreicht! Höchste Kachel: {tile}. Probier es aus!', ko: 'Fibo에서 {score}점 달성! 최고 타일: {tile}. 도전해 보세요!', fr: "J'ai obtenu {score} points dans Fibo ! Plus haute tuile : {tile}. Essayez !", pt: 'Fiz {score} pontos no Fibo! Maior peça: {tile}. Experimente!', es: '¡Hice {score} puntos en Fibo! Mayor ficha: {tile}. ¡Pruébalo!' },
  shareNewRecord: { tr: 'Fibo\'da yeni rekor! {score} puan! En yüksek taşım: {tile}. Sen de dene!', en: 'New record in Fibo! I scored {score}! Highest tile: {tile}. Try it!', ja: 'Fibo新記録！{score}点達成！最高タイル: {tile}。挑戦してみて！', de: 'Neuer Rekord in Fibo! {score} Punkte! Höchste Kachel: {tile}. Probier es!', ko: 'Fibo 새 기록! {score}점! 최고 타일: {tile}. 도전하세요!', fr: 'Nouveau record dans Fibo ! {score} points ! Plus haute tuile : {tile}. Essayez !', pt: 'Novo recorde no Fibo! {score} pontos! Maior peça: {tile}. Experimente!', es: '¡Nuevo récord en Fibo! ¡{score} puntos! Mayor ficha: {tile}. ¡Pruébalo!' },
} as const;

export type StringKey = keyof typeof strings;

export function getStrings(lang: Language) {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(strings)) {
    result[key] = (val as Record<string, string>)[lang] ?? (val as Record<string, string>)['en'];
  }
  return result as Record<StringKey, string>;
}

export function useT() {
  const { settings } = useSettings();
  return getStrings(settings.language ?? 'tr');
}
