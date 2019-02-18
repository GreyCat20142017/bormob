const getValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return (index > -1)
    ?
    ((index + 1) < process.argv.length ? process.argv[index + 1] : null)
    :
    null;
}

module.exports = {
  getValue
}