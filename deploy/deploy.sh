#!/usr/bin/env bash
# Desplegament dels meus projectes al servidor DAW (Hestia).
#
#   deploy/deploy.sh <projecte>...     ex: deploy/deploy.sh time-attack portfolio
#   deploy/deploy.sh tot               tots els projectes
#   deploy/deploy.sh estat             què hi ha en marxa al servidor
#
# Regla d'or: el que hi ha al servidor = el que hi ha a GitHub.
# Per això, abans de desplegar, el repo local ha d'estar net (tot amb commit) i pujat (push).
#
# - Frontends (portfolio, time-attack, cat-clicker): es compilen AQUÍ i es pugen amb rsync.
#   (El servidor és compartit i va just de RAM: no hi compilem.)
# - Backends (banderas, time-attack-api): al servidor són clons de GitHub a ~/apps;
#   es fa git pull i pm2 els reinicia. Els secrets (.env) només existeixen al servidor.
set -euo pipefail

main() {
  SERVER=daw                     # alias de ~/.ssh/config (cal la VPN)
  CCC=~/ccc                      # on tinc els repos en local
  WEB=web/a25campracar.daw.inspedralbes.cat/public_html          # relatiu a la home del servidor
  PORTFOLIO_WEB=web/portfolio.c.daw.inspedralbes.cat/public_html
  DIR=$(cd "$(dirname "$0")" && pwd)
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT

  [ $# -gt 0 ] || { sed -n '2,15p' "$0"; exit 1; }
  [ "$1" = tot ] && set -- banderas time-attack-api time-attack cat-clicker portfolio

  for p in "$@"; do
    echo "━━ $p"
    case $p in
      portfolio)       portfolio ;;
      time-attack)     time_attack ;;
      cat-clicker)     cat_clicker ;;
      banderas)        backend banderas juegodBanderas "$CCC/tr0daw" "cd backend && npm ci --omit=dev --no-audit --no-fund" ;;
      time-attack-api) backend time-attack-api backend_TIME_ATTACK "" "npm install --omit=dev --no-audit --no-fund" ;;
      estat)           estat ;;
      *) echo "✗ Projecte desconegut: $p"; exit 1 ;;
    esac
  done
  echo "✓ Fet"
}

# El repo no té canvis pendents i la branca és igual que a GitHub
comprovar() {
  local r=$1 up
  git -C "$r" fetch -q
  [ -z "$(git -C "$r" status --porcelain)" ] || { echo "✗ $r té canvis sense commit"; exit 1; }
  up=$(git -C "$r" rev-parse --abbrev-ref '@{u}' 2>/dev/null) || { echo "✗ $r: la branca no té remot (fes git push -u)"; exit 1; }
  [ "$(git -C "$r" rev-parse HEAD)" = "$(git -C "$r" rev-parse "$up")" ] || { echo "✗ $r no és igual que $up (fes push o pull)"; exit 1; }
  echo "  $(basename "$r") · $(git -C "$r" rev-parse --abbrev-ref HEAD) · $(git -C "$r" log --oneline -1)"
}

# Deixa constància de quin commit s'ha publicat: <url>/version.txt
versio() { # repo carpeta
  git -C "$1" log -1 --format="%H%n%ad%n%s%n$(git -C "$1" remote get-url "$(git -C "$1" rev-parse --abbrev-ref '@{u}' | cut -d/ -f1)")" --date=iso > "$2/version.txt"
}

vite_build() { # repo base sortida
  (cd "$1" && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npx vite build --base="$2" --outDir "$3" --emptyOutDir --logLevel warn)
}

publicar() { # carpeta_local desti_al_servidor
  rsync -az --delete --chmod=D755,F644 "$1"/ "$SERVER:$2"/
  echo "  → $2"
}

portfolio() {
  local r=$CCC/portfolio
  comprovar "$r"
  (cd "$r" && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npx tsc && npx vite build --outDir "$TMP/portfolio" --emptyOutDir --logLevel warn)
  versio "$r" "$TMP/portfolio"
  publicar "$TMP/portfolio" "$PORTFOLIO_WEB"
  # Pàgina d'inici del domini principal (llista de projectes)
  rsync -az --chmod=F644 "$DIR/landing/index.html" "$SERVER:$WEB/index.html"
}

time_attack() {
  local r=$CCC/client/gameAttack/timeAttack
  comprovar "$r"
  vite_build "$r" /time-attack/ "$TMP/time-attack"   # usa .env.production
  versio "$r" "$TMP/time-attack"
  publicar "$TMP/time-attack" "$WEB/time-attack"
}

cat_clicker() {
  local r=$CCC/client/catClicker
  comprovar "$r"
  # Versions estàtiques: exactament els fitxers del commit
  mkdir -p "$TMP/cat-clicker" && git -C "$r" archive HEAD | tar -x -C "$TMP/cat-clicker"
  rm -f "$TMP/cat-clicker/.gitignore"
  cp "$DIR/landing/cat-clicker.html" "$TMP/cat-clicker/index.html"   # índice de versiones
  # La versió Vue + Vite (repo catClicker-vue) encara està a mitges: quan estigui, descomenta:
  # comprovar "$r/catClicker4-vue"
  # vite_build "$r/catClicker4-vue" /cat-clicker/catClicker4-vue/ "$TMP/cat-clicker/catClicker4-vue"
  versio "$r" "$TMP/cat-clicker"
  publicar "$TMP/cat-clicker" "$WEB/cat-clicker"
}

backend() { # nom_pm2 carpeta_a_apps repo_local(opcional) instal·lar
  local nom=$1 carpeta=$2 r=$3 instal=$4
  [ -z "$r" ] || comprovar "$r"
  rsync -az "$DIR/ecosystem.config.cjs" "$SERVER:apps/ecosystem.config.cjs"
  ssh "$SERVER" "set -e; cd ~/apps/$carpeta && git pull -q --ff-only && echo \"  servidor · \$(git log --oneline -1)\" \
    && $instal >/dev/null && pm2 startOrReload ~/apps/ecosystem.config.cjs --only $nom --update-env >/dev/null && pm2 save >/dev/null \
    && pm2 ls | grep -E ' $nom '"
}

estat() {
  ssh "$SERVER" 'pm2 ls; for d in ~/apps/*/; do [ -d "$d.git" ] && printf "  %-22s %s\n" "$(basename "$d")" "$(git -C "$d" log --oneline -1)"; done'
  for u in http://a25campracar.daw.inspedralbes.cat/time-attack/version.txt \
           http://a25campracar.daw.inspedralbes.cat/cat-clicker/version.txt \
           http://portfolio.c.daw.inspedralbes.cat/version.txt; do
    printf "  %-60s %s\n" "$u" "$(curl -s -m 5 "$u" | sed -n 3p || echo '?')"
  done
  printf "  banderas  :20600  %s\n" "$(curl -s -m 5 -o /dev/null -w '%{http_code}' http://daw.inspedralbes.cat:20600/)"
  printf "  socket.io :20601  %s\n" "$(curl -s -m 5 -o /dev/null -w '%{http_code}' 'http://daw.inspedralbes.cat:20601/socket.io/?EIO=4&transport=polling')"
}

main "$@"
