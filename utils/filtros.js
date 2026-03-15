function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function correspondeBusca(item, termo, campos) {
  if (!termo) return true;
  const termoNormalizado = normalizarTexto(termo);
  return campos.some(campo => normalizarTexto(item[campo]).includes(termoNormalizado));
}

function dentroDoPeriodo(item, camposData, dataInicio, dataFim) {
  if (!dataInicio && !dataFim) return true;

  const valorData = camposData
    .map(campo => item[campo])
    .find(Boolean);

  if (!valorData) return false;

  const dataItem = new Date(String(valorData).includes('T') ? valorData : `${valorData}T00:00:00`);
  if (Number.isNaN(dataItem.getTime())) return false;

  if (dataInicio) {
    const inicio = new Date(`${dataInicio}T00:00:00`);
    if (dataItem < inicio) return false;
  }

  if (dataFim) {
    const fim = new Date(`${dataFim}T23:59:59`);
    if (dataItem > fim) return false;
  }

  return true;
}

module.exports = {
  normalizarTexto,
  correspondeBusca,
  dentroDoPeriodo
};
