function die() {
  return (crypto.randomBytes(1)[0] % 6) + 1;
}
