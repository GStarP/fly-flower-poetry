/**
 * 跳转到古诗词名句网搜索页面
 * @param title 诗词标题
 * @param author 作者
 */
export const openPoetrySearch = (title: string, author: string): void => {
  const processedTitle = title.split(' ')[0]
  const searchUrl = `https://www.gushicimingju.com/search/alls/${encodeURIComponent(processedTitle)}+${encodeURIComponent(author)}`;
  window.open(searchUrl, '_blank');
};