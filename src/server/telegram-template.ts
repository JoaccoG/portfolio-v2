import { copy } from '../i18n/t';

const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const periodDate = (): string => {
	const m = copy.masthead;
	const now = new Date();
	return m.dateTemplate
		.replace('{month}', m.months[now.getMonth()] ?? '')
		.replace('{day}', String(now.getDate()))
		.replace('{year}', String(now.getFullYear() - 100));
};

const SERIF = "Georgia, 'Times New Roman', serif";

export function buildTelegramHtml(email: string, message: string): string {
	const safeEmail = escapeHtml(email);
	const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
	const received = periodDate();
	return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#0f0c08;">
<div style="background-color:#0f0c08;padding:36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#f2ead8;border:3px double #6d675d;">
<tr><td style="padding:30px 34px 26px;font-family:${SERIF};color:#1c1710;">
<p style="margin:0;text-align:center;font-size:11px;letter-spacing:5px;color:#1c1710;">THE&nbsp;DAILY&nbsp;GODOY</p>
<p style="margin:8px 0 0;text-align:center;color:#b4342a;font-size:13px;">&#10038;</p>
<h1 style="margin:14px 0 0;text-align:center;font-family:${SERIF};font-size:27px;font-weight:700;letter-spacing:1px;color:#1c1710;">Telegram to the Editor</h1>
<p style="margin:8px 0 0;text-align:center;font-style:italic;font-size:11px;letter-spacing:2px;color:#3a3222;">ALL WIRES ANSWERED WITHIN TWO DAYS</p>
<hr style="border:none;border-top:3px double #7a746a;margin:20px 0 16px;" />
<p style="margin:0;font-size:10px;letter-spacing:3px;font-weight:700;color:#1c1710;">FROM &mdash; <a href="mailto:${safeEmail}" style="color:#b4342a;text-decoration:underline;">${safeEmail}</a></p>
<p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;font-weight:700;color:#1c1710;">RECEIVED &mdash; ${received}</p>
<hr style="border:none;border-top:1px dotted #8d8678;margin:16px 0 20px;" />
<p style="margin:0;font-style:italic;font-size:16px;line-height:1.9;color:#1c1710;">${safeMessage}</p>
<hr style="border:none;border-top:1px dotted #8d8678;margin:20px 0 16px;" />
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-family:${SERIF};font-size:10px;letter-spacing:2px;color:#3a3222;font-style:italic;vertical-align:bottom;">RESPONSE WINDOW &mdash; 48 HOURS</td>
<td align="right" style="vertical-align:bottom;">
<table role="presentation" cellpadding="0" cellspacing="0" style="border:1px dashed #8d8678;"><tr><td style="padding:3px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid #a8352c;"><tr><td style="padding:7px 11px;color:#a8352c;font-family:${SERIF};font-size:9px;letter-spacing:2px;text-align:center;line-height:1.7;">&#10086;<br /><b>2&cent;</b><br />ELECTRONIC<br />POST</td></tr></table>
</td></tr></table>
</td>
</tr></table>
</td></tr>
</table>
<p style="font-family:${SERIF};font-size:9px;letter-spacing:3px;color:#8d8678;margin:18px 0 0;text-align:center;">DISPATCHED BY THE MACHINERY &middot; A REPLY REACHES THE SENDER</p>
</td></tr></table>
</div>
</body>
</html>`;
}
