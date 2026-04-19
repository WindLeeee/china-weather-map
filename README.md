# 鍏ㄥ浗澶╂皵鍦板浘 馃對锔?
鍩轰簬 Open-Meteo API 鐨勪腑鍥藉煄甯傚ぉ姘旈鎶ワ紝鏀寔鏈潵 16 澶╅€愭棩棰勬姤銆?
---

## 浣跨敤鏂瑰紡

### 鏂瑰紡涓€锛氭湰鍦版湇鍔″櫒锛堟帹鑽愶紝閫熷害蹇級

**闇€瑕佸厛瀹夎 Node.js锛?8+锛?*

```bash
cd D:\Desktop\weather-map-app
npm install
node server.js
```

鐒跺悗娴忚鍣ㄦ墦寮€ http://localhost:3000

**鏁堟灉锛?*
- 棣栨鍔犺浇绾?30-60 绉掞紙鏈嶅姟鍣ㄥ苟鍙戣姹?155 涓煄甯傦級
- 涔嬪悗 30 鍒嗛挓鍐呭啀娆¤闂?*绉掑紑**锛堣蛋鏈嶅姟绔紦瀛橈級
- 鍏朵粬浜鸿闂?`http://浣犵殑IP:3000` 鍗冲彲

---

### 鏂瑰紡浜岋細鐩存帴鍙屽嚮鎵撳紑锛堝鐢級

鐩存帴鍙屽嚮 `index.html`锛屼絾浼氭湁浠ヤ笅闂锛?- 鍔犺浇鏋佹參锛堟祻瑙堝櫒骞跺彂闄愬埗锛?55 涓煄甯備覆琛岃姹傦級
- 閮ㄥ垎娴忚鍣ㄥ彲鑳芥嫤鎴紙璺ㄥ煙闄愬埗锛?
---

## 鍔熻兘璇存槑

| 鍔熻兘 | 璇存槑 |
|------|------|
| 馃搮 鏃ユ湡鍒囨崲 | 椤堕儴妯潯鏀寔鍒囨崲浠婂ぉ + 鏈潵 15 澶?|
| 馃椇锔?鍦板浘缂╂斁 | 榧犳爣婊氳疆缂╂斁锛屾嫋鎷界Щ鍔?|
| 馃搵 鍩庡競鍒楄〃 | 鎸夋渶楂樻俯搴︽帓搴忥紝鐐瑰嚮鍙畾浣嶅埌鍦板浘 |
| 馃尅锔?娓╁害鏄剧ず | 鍦板浘鐐规樉绀烘渶楂樻俯/鏈€浣庢俯 |
| 鈴憋笍 缂撳瓨 | 鏈嶅姟鍣ㄧ 30 鍒嗛挓缂撳瓨 |

---

## 閮ㄧ讲鍒颁簯绔紙璁╂墍鏈変汉璁块棶锛?
### 鏂规涓€锛歊ailway锛堝厤璐癸紝鎺ㄨ崘锛?
1. 涓婁紶 `server.js`銆乣index.html`銆乣package.json` 鍒?GitHub
2. 鍦?[Railway.app](https://railway.app) 鏂板缓椤圭洰锛岃繛鎺?GitHub
3. Railway 鑷姩璇嗗埆 Node.js 骞堕儴缃?4. 鑾峰緱涓€涓叕缃?URL锛堝 `xxx.railway.app`锛?
### 鏂规浜岋細Vercel + Serverless Functions

灏嗘湇鍔″櫒鏀瑰啓涓?Vercel Serverless Function锛屾垨浣跨敤 Next.js 妗嗘灦銆?
### 鏂规涓夛細鑵捐浜?闃块噷浜?ECS

```bash
ssh 鍒版湇鍔″櫒
yum install nodejs -y   # 鎴栫敤 nvm
git clone 浣犵殑浠撳簱
npm install
PORT=80 node server.js
```

閰嶅悎 Nginx 鍙嶅悜浠ｇ悊 + HTTPS銆?
---

## 鎶€鏈鏄?
| 椤圭洰 | 璇存槑 |
|------|------|
| 鍓嶇 | 鍘熺敓 HTML/JS + ECharts 5 |
| 鍚庣 | Node.js锛堟棤妗嗘灦锛?|
| 鍦板浘鏁版嵁 | 闃块噷浜?DataV GeoJSON |
| 澶╂皵鏁版嵁 | Open-Meteo API锛堝厤璐癸紝鏃犻渶 Key锛?|
| 鏁版嵁缁村害 | 娓╁害銆佸ぉ姘旂姸鍐点€侀檷姘撮噺銆侀閫?|
| 棰勬姤澶╂暟 | 16 澶╋紙Open-Meteo 鍏嶈垂鐗堥檺鍒讹級 |

---

## 鐩綍缁撴瀯

```
weather-map-app/
鈹溾攢鈹€ index.html      # 鍓嶇椤甸潰锛堝湴鍥?+ UI锛?鈹溾攢鈹€ server.js       # 鍚庣鏈嶅姟鍣紙鏁版嵁鑱氬悎 + 缂撳瓨锛?鈹溾攢鈹€ package.json    # Node.js 渚濊禆
鈹斺攢鈹€ README.md       # 鏈枃浠?```
