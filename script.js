const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertButton = document.getElementById('convert');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

convertButton.addEventListener('click', () => {
  const amount = amountInput.value;
  const from = fromSelect.value;
  const to = toSelect.value;

  // 로딩 표시
  loadingDiv.classList.remove('hidden');

  // 오늘 날짜 계산
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  const searchdate = `${year}${month}${day}`;

  // API 호출 (예: 한국수출입은행 API)
  const apiKey = "v9IB2PwuXIuz8etaoiomVtfNiOscmxx5"; // 실제 API 키로 변경
  const apiUrl = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&searchdate=${searchdate}&data=AP01`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const exchangeRate = getExchangeRate(data, from, to); 
      if (exchangeRate > 0) {
        const result = amount * exchangeRate;
        resultDiv.innerText = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
      } else {
        resultDiv.innerText = "환율 정보를 찾을 수 없습니다.";
      }
    })
    .catch(error => {
      console.error('환율 변환 오류:', error);
      resultDiv.innerText = '환율 변환에 실패했습니다.';
    })
    .finally(() => {
      // 로딩 숨김
      loadingDiv.classList.add('hidden');
    });
});

function getExchangeRate(data, from, to) {
  // API 응답 데이터에서 from, to에 해당하는 환율 찾기
  // 실제 데이터 구조에 맞게 수정해야 합니다.
  for (const item of data) {
    if (item.cur_unit === from && item.ttb === 'TTB') {
      const rate = parseFloat(item.deal_bas_r.replace(",", ""));
      if (to === 'KRW') {
        return rate;
      } else {
        // 다른 통화로 변환 (예: USD 기준)
        const usdRate = getExchangeRate(data, from, 'USD');
        const toRate = getExchangeRate(data, to, 'USD');
        return rate / usdRate * toRate;
      }
    }
  }
  return 0; // 환율 정보를 찾지 못한 경우
}