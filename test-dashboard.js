const { chromium } = require('playwright');

async function testDashboard() {
  console.log('대시보드 페이지 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 콘솔 에러 수집
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 페이지로 이동
    console.log('페이지 로딩 중...');
    await page.goto('http://localhost:3001/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // React 렌더링 대기

    console.log('✅ 페이지가 성공적으로 로드되었습니다.');

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);

    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'dashboard-screenshot.png', 
      fullPage: true 
    });
    console.log('✅ 스크린샷이 저장되었습니다: dashboard-screenshot.png');

    // 위젯 확인
    console.log('위젯 렌더링 상태 확인...');
    
    // 위젯 컨테이너 확인
    const widgetContainer = await page.locator('[data-testid="widget-container"], .widget-container, .grid-container').first();
    if (await widgetContainer.isVisible()) {
      console.log('✅ 위젯 컨테이너가 렌더링되었습니다.');
    } else {
      console.log('⚠️ 위젯 컨테이너를 찾을 수 없습니다.');
    }

    // 개별 위젯 확인
    const widgets = await page.locator('[class*="widget"], [data-widget]').all();
    console.log(`발견된 위젯 수: ${widgets.length}`);

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      const isVisible = await widget.isVisible();
      const classList = await widget.getAttribute('class');
      console.log(`위젯 ${i + 1}: ${isVisible ? '✅ 표시됨' : '❌ 숨겨짐'} - 클래스: ${classList}`);
    }

    // React key prop 에러 확인
    console.log('콘솔 에러 확인...');
    const keyErrors = consoleErrors.filter(error => 
      error.includes('key') || 
      error.includes('Warning') || 
      error.includes('Each child in a list should have a unique')
    );
    
    if (keyErrors.length === 0) {
      console.log('✅ React key prop 관련 에러가 없습니다.');
    } else {
      console.log('❌ React key prop 관련 에러 발견:');
      keyErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // 모든 콘솔 에러 출력
    if (consoleErrors.length === 0) {
      console.log('✅ 콘솔 에러가 없습니다.');
    } else {
      console.log(`❌ 총 ${consoleErrors.length}개의 콘솔 에러 발견:`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // DOM 구조 확인
    const bodyContent = await page.locator('body').innerHTML();
    const hasReactRoot = bodyContent.includes('__next') || bodyContent.includes('react');
    console.log(`React 앱 감지: ${hasReactRoot ? '✅' : '❌'}`);

    // 추가 상태 확인
    const url = page.url();
    console.log(`현재 URL: ${url}`);
    
    const loadState = await page.evaluate(() => document.readyState);
    console.log(`문서 로드 상태: ${loadState}`);

  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error.message);
  } finally {
    await browser.close();
  }
}

testDashboard().catch(console.error);