const { exec } = require('child_process');
const path = require('path');

console.log('🔍 エラーチェック開始...\n');

// TypeScriptの型チェック
console.log('📝 TypeScript型チェック中...');
exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ TypeScriptエラー:');
    console.error(stderr || stdout);
  } else {
    console.log('✅ TypeScript: OK');
  }

  // ESLintチェック（もし設定されていれば）
  console.log('\n📝 構文チェック中...');
  exec('npx next lint', (lintError, lintStdout, lintStderr) => {
    if (lintError && !lintStdout.includes('No ESLint configuration')) {
      console.error('❌ Lintエラー:');
      console.error(lintStderr || lintStdout);
    } else {
      console.log('✅ 構文: OK');
    }

    // ビルドテスト
    console.log('\n🏗️ ビルドテスト中...');
    exec('npx next build --no-lint', { maxBuffer: 1024 * 1024 * 10 }, (buildError, buildStdout, buildStderr) => {
      if (buildError) {
        console.error('❌ ビルドエラー:');
        // ビルドエラーから重要な部分を抽出
        const errorLines = (buildStderr || buildStdout).split('\n');
        const relevantErrors = errorLines.filter(line => 
          line.includes('Error:') || 
          line.includes('error') || 
          line.includes('Module parse failed') ||
          line.includes('Identifier') ||
          line.includes('Unexpected')
        );
        console.error(relevantErrors.join('\n'));
      } else {
        console.log('✅ ビルド: OK');
      }

      console.log('\n📊 チェック完了!');
    });
  });
});