var express = require('express'),
    app = express(),
    fs = require('fs'),
    _ = require('underscore');

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
var json_players = fs.readFileSync(__dirname + '/data/jogadores.json', 'utf8')
var json_games_player = fs.readFileSync(__dirname + '/data/jogosPorJogador.json', 'utf8')
var db = {
    "players": JSON.parse(json_players).players,
    "games_player": JSON.parse(json_games_player)
};


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs')
app.set('views', 'server/views')


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.get('/', (req, res) => {
    res.render('index', {'players': db.players});
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
app.get('/jogador/:identifier_number/', (req, res) => {
    console.log(req.params.identifier_number)
    var steamId_player = req.params.identifier_number
    player = findPlayer(steamId_player)
    console.log(player)
    player.numberGamesNotPlayed = playerNumberGamesNotPlayed(steamId_player).length
    player.numberGames = playerNumberGames(steamId_player)
    player.topFive = playerTopLimitGames(steamId_player, 5)
    player.favGame = player.topFive[0]
    addPlayedTimeField(player)
    
    res.render('jogador', {
        'player': player,
        'games': db.games_player[steamId_player]
    });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código

app.use(express.static(__dirname + '/client'))

// abrir servidor na porta 3000
// dica: 1-3 linhas de código

var server = app.listen(3000, function(){})

function findPlayer (steamId)
{
    return _.find(db.players, (element) => {
        return element.steamid === steamId
    })
};

function playerNumberGamesNotPlayed (steamId)
{
    return _.where(db.games_player[steamId].games, {playtime_forever: 0})   
}

function playerNumberGames(steamId)
{
    return db.games_player[steamId].game_count
}

function playerTopLimitGames (steamId, limit)
{
    return _.first(playerGamesListOrdererTimePlayed(steamId), limit)
}

function playerGamesListOrdererTimePlayed (steamId)
{
    return _.sortBy(db.games_player[steamId].games, (element) => {
        -element.playtime_forever
    })
}

function addPlayedTimeField (player)
{
    player.favGame.played_time = (player.favGame.playtime_forever / 60).toFixed(1)
    for (i in player.topFive)
    {
        player.topFive[i].played_time = (player.topFive[i].playtime_forever / 60).toFixed(1)
    }
}
