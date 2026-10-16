# 素材来源与制作记录

## 页面实际引用

| 文件 | 来源与处理 | 用途 |
| --- | --- | --- |
| `src/assets/memory-room.png` | 创作者提供的原始实拍照片，原文件保留 | 屏幕内部的递归房间 |
| `src/assets/television-foreground-aged.png` | 以用户照片制作透明前景，补全截断的叶缘，并参考用户的日记模板做旧；使用内置 imagegen 工具 | 仅绝对编号为 0 的首屏电视、盆栽、摆件与天线 |
| `src/assets/diary-window.png` | 创作者提供的日记模板，原文件保留 | 九宫格阅读窗口；其中空白纸面作为首屏材质 |
| `src/assets/fonts/fusion-pixel-12px-zh-hans.woff2` | [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font) 官方示例网站提供的 12px 简体中文 WOFF2，未修改 | 中文像素字形；英文继续使用原系统等宽字体 |

字体来源：https://fusion-pixel-font.takwolf.com/fusion-pixel-12px-proportional-zh_hans.otf.woff2

字体 SHA-256：`acd8224934793e0ba0e55b8c5a4c6278b42cee0211f4dc53f5e8267a29b88b88`。

字体采用 SIL Open Font License 1.1，原许可证放在字体目录及 `public/licenses/fusion-pixel-OFL.txt`，后者会进入生产包。创作者提供的图片不自动改成开源授权。自行编写的代码及素材来源请分别处理。

## 图像编辑方式

使用内置 imagegen，透明背景打开，未调用 CLI/API，也没有在浏览器中引入 AI。最终资产已复制进项目，运行不依赖生成工具。三轮编辑分别为：原照片透明抠图、补全左侧叶缘、机壳材质做旧。前两轮中间稿留在工作区备份，网站使用最终做旧稿。

最后一轮编辑提示词（英文原文）：

> Use case: precise-object-edit. Image 1 is the transparent television foreground to EDIT. Image 2 is ONLY a material-aging reference. Make image 1 feel as authentically worn and time-aged as the second image’s cream paper and tarnished beige desktop window. Preserve image 1’s EXACT composition, portrait framing, positions, television silhouette, feet, glass-screen outline, antenna positions, pot, figurine and fully contained uncut plant. Add restrained realistic age to the casing: faded mustard / ochre yellow plastic, subtle nicotine patina in seams, dusty speaker grooves, fine off-white scuffs, tiny rubbed edges and hairline scratches. Reduce the clean glossy new-product impression. Keep photographic sharpness and original detail; do NOT blur or reduce resolution. Keep the glass screen’s shape and contents unchanged. Keep original lighting and alpha-transparent background, no wall/table. Take only the aging material/color language from image 2; do NOT add a paper sheet, window, icons, frame, typography, labels or new objects. No rearrangement, cropping, recentering or rescaling. The complete plant stays within the canvas. Actual alpha transparency.

中文概括：首屏抠出电视及顶部物件，叶片自然收尾，保留完整轮廓，加入褪色黄塑料、细擦痕、接缝灰尘与表面暗沉。纸质斑驳由同一张日记模板的空白区域提供。玻璃区域由实时递归重新绘制。

## 调色与清晰度

曾短暂试验柔焦和低分辨率 DV 重采样，按用户反馈已撤销。最终版本保留渲染分辨率，仅做轻度去饱和及褪色调色；没有模糊滤镜或历史帧反馈。
