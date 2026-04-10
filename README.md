# stayboostagency

## EmailJS 문의 메일 설정

`index.html` 안의 `EMAILJS_CONFIG` 값을 실제 EmailJS 발급값으로 바꾸면 문의 폼이 메일 전송으로 동작합니다.

- `YOUR_EMAILJS_PUBLIC_KEY`
- `YOUR_EMAILJS_SERVICE_ID`
- `YOUR_EMAILJS_TEMPLATE_ID`

EmailJS 템플릿에는 아래 필드를 매핑하면 됩니다.

- `hotel_name`
- `contact_name`
- `reply_to`
- `phone`
- `message`
- `submitted_at`
