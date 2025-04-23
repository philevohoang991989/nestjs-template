export function getOrderByClause(sortQuery: string) {
  const fields = sortQuery.split(',');
  const orderBy = {};
  for (const field of fields) {
    if (field.startsWith('-')) {
      orderBy[field.substring(1)] = 'DESC';
    } else if (field.startsWith('+')) {
      orderBy[field.substring(1)] = 'ASC';
    } else {
      orderBy[field] = 'ASC';
    }
  }

  return orderBy;
}
