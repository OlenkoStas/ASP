//по умолчанию начало игра с cpu
$('#giveUp').hide();


// Checkers Game

// black.gif
// gray.gif
// you1.gif -- normal piece (player/red)
// you2.gif -- highlighted piece
// you1k.gif -- kinged normal piece
// you2k.gif -- kinged highlighted piece
// me1.gif -- normal piece (computer/black)
// me2.gif -- highlighted piece
// me1k.gif -- kinged normal piece
// me2k.gif -- kinged highlighted piece


function preload() {
    this.length = preload.arguments.length;
    for (var i = 0; i < this.length; i++) {
        this[i] = new Image();
        this[i].src = preload.arguments[i];
    }
}
var pics = new preload("../Images/black.gif", "../Images/gray.gif",
    "../Images/you1.gif", "../Images/you2.gif", "../Images/you1k.gif", "../Images/you2k.gif",
    "../Images/me1.gif", "../Images/me2.gif", "../Images/me1k.gif", "../Images/me2k.gif");

var black = -1; // computer is black
var red = 1; // visitor is red
var square_dim = 65;
var piece_toggled = false;
var my_turn = true;
var double_jump = false;
var comp_move = false;
var game_is_over = false;
var safe_from = safe_to = null;
var toggler = null;
var togglers = 0;
var my_color = "white";
var with_cpu = true;

const bridge = $.connection.chatHub;
var rivalId = "";
var rival_name = "";
var interval = null;
var gameHistory = "";

function Board() {
    boardStart = new Array();
    for (var i = 0; i < 8; i++) {
        boardStart[i] = new Array();
        for (var j = 0; j < 8; j++)
            boardStart[i][j] = Board.arguments[8 * j + i];
    }
    boardStart[-2] = new Array(); // prevents errors
    boardStart[-1] = new Array(); // prevents errors
    boardStart[8] = new Array(); // prevents errors
    boardStart[9] = new Array(); // prevents errors
    BoardClone();
}
function BoardClone() {
    board = new Array();
    for (var i = 0; i < 8; i++) {
        board[i] = new Array();
        for (var j = 0; j < 8; j++)
            board[i][j] = boardStart[i][j];
    }
    board[-2] = new Array(); // prevents errors
    board[-1] = new Array(); // prevents errors
    board[8] = new Array(); // prevents errors
    board[9] = new Array(); // prevents errors
}
var board;
var boardStart;
Board(1, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, -1, 0, -1, 0, -1, 0, -1,
    -1, 0, -1, 0, -1, 0, -1, 0,
    0, -1, 0, -1, 0, -1, 0, -1);

//инвертирует доску
function boardInvert() {
    let newBoard = new Array();
    for (var i = 0; i < 8; i++) {
        newBoard[i] = new Array();
        for (var j = 0; j < 8; j++) {
            if (board[i][j] == 1)
                newBoard[i][j] = -1;
            else if (board[i][j] == -1)
                newBoard[i][j] = 1;
            else
                newBoard[i][j] = 0;
        }
    }
    board = newBoard;
    board[-2] = new Array(); // prevents errors
    board[-1] = new Array(); // prevents errors
    board[8] = new Array(); // prevents errors
    board[9] = new Array(); // prevents errors
}
// 1 начало с проверки
function message(str) {
    if (!game_is_over) {
       $('#message').val(str);
    }
}
function moveable_space(i, j) {
    // calculates whether it is a gray (moveable)
    // or black (non-moveable) space
    return (((i % 2) + j) % 2 == 0);
}
function Coord(x, y) {
    this.x = x;
    this.y = y;
}
function coord(x, y) {
    c = new Coord(x, y);
    return c;
}

/****************************************** прорисовка *********************************************************/
document.write("<table id='board' border=0 cellspacing=0 cellpadding=0 width=" + (square_dim * 8 + 8)
    + "<tr><td><img src='../Images/black.gif' width=" + (square_dim * 8 + 8)
    + " height=4><br></td></tr>");
for (var j = 0; j < 8; j++) {
    document.write("<tr><td><img src='../Images/black.gif' width=4 height=" + square_dim + ">");
    for (var i = 0; i < 8; i++) {
        if (moveable_space(i, j))
            document.write("<a href='javascript:clicked(" + i + "," + j + ")'>");
        document.write("<img src='../Images/");
        if (board[i][j] == 1) document.write("you1.gif");
        else if (board[i][j] == -1) document.write("me1.gif");
        //если прорисовывать все поле то здесь добавить 2 и -2
        else if (moveable_space(i, j)) document.write("gray.gif");
        else document.write("black.gif");
        document.write("' width=" + square_dim + " height=" + square_dim
            + " name='space" + i + "" + j + "' border=0>");
        if (moveable_space(i, j)) document.write("</a>");
    }
    document.write("<img src='../Images/black.gif' width=4 height=" + square_dim + "></td></tr>");
}
document.write("<tr><td><img src='../Images/black.gif' width=" + (square_dim * 8 + 8)
    + " height=4><br></td></tr></table>"
    + "<form name='disp' id='disp'><textarea id='message' name='message' style='resize:none;color:#864f07;font-weight:600;' wrap=virtual rows=4 cols=50></textarea><br><input "
    + "type=button id='reload' value='Начать заново' onClick=refresh()><input type=button id='btnWithCpu' class='active' disabled='disabled' value='Игра с компьютером'></form>");
message("Вы можете начать! Выберите белую шашку для перемещения.");
/***************************************************************************************************/
function clicked(i, j) {

    if (my_turn) {
        if (integ(board[i][j]) == 1) toggle(i, j);
        else if (piece_toggled) move(selected, coord(i, j));
        else message("Сначала нажмите на одну из ваших белых шашек, затем нажмите туда, куда вы хотите переместить её.");
    } else {
        message("Это еще не ваша очередь. Подожди секунду!");
    }
}
function toggle(x, y) {
    if (my_turn) {
        if (piece_toggled)

            draw(selected.x, selected.y, (with_cpu ? "../Images/you1" : (my_color == "white" ? "../Images/you1" : "../Images/me1")) + ((board[selected.x][selected.y] == 1.1) ? "k" : "") + ".gif");
        if (piece_toggled && (selected.x == x) && (selected.y == y)) {
            piece_toggled = false;
            if (double_jump) { my_turn = double_jump = false; computer(); }
        } else {
            piece_toggled = true;
            draw(x, y, (with_cpu ? "../Images/you2" : (my_color == "white" ? "../Images/you2" : "../Images/me2")) + ((board[x][y] == 1.1) ? "k" : "") + ".gif");
        }
        selected = coord(x, y);
    } else//если на моя очередь
    {

        if ((piece_toggled) && (integ(board[selected_c.x][selected_c.y]) == -1))
            draw(selected_c.x, selected_c.y, (with_cpu ? "../Images/me1" : (my_color == "white" ? "../Images/me1" : "../Images/you1")) + ((board[selected_c.x][selected_c.y] == -1.1) ? "k" : "") + ".gif");
        if (piece_toggled && (selected_c.x == x) && (selected_c.y == y)) {
            piece_toggled = false;
        } else {
            piece_toggled = true;
            draw(x, y, (with_cpu ? "../Images/me2" : (my_color == "white") ? "../Images/me2" : "../Images/you2") + ((board[x][y] == -1.1) ? "k" : "") + ".gif");
        }
        selected_c = coord(x, y);
    }
}
function draw(x, y, name) {
    document.images["space" + x + "" + y].src = name;
}
function integ(num) {
    if (num != null)
        return Math.round(num);
    else
        return null;
}
function abs(num) {
    return Math.abs(num);
}
function sign(num) {
    if (num < 0) return -1;
    else return 1;
}
function concatenate(arr1, arr2) {
    // function tacks the second array onto the end of the first and returns result
    for (var i = 0; i < arr2.length; i++)
        arr1[arr1.length + i] = arr2[i];
    return arr1;
}
function legal_move(from, to) {
    if ((to.x < 0) || (to.y < 0) || (to.x > 7) || (to.y > 7)) return false;
    piece = board[from.x][from.y];
    if (my_color == "black")
        distance = coord((to.x - from.x) * -1, (to.y - from.y) * -1);
    else
        distance = coord(to.x - from.x, to.y - from.y);
    if ((distance.x == 0) || (distance.y == 0)) {
        message("Вы можете двигаться только по диагонали.");
        return false;
    }
    if (abs(distance.x) != abs(distance.y)) {
        message("Неверный ход.");
        return false;
    }
    if (abs(distance.x) > 2) {
        message("Неверный ход.");
        return false;
    }
    if ((abs(distance.x) == 1) && double_jump) {
        return false;
    }
    if ((board[to.x][to.y] != 0) || (piece == 0)) {
        return false;
    }

    var rez;
    if (my_color == "white")
        rez = - integ(board[from.x + sign(distance.x)][from.y + sign(distance.y)]);
    else
        rez = - integ(board[from.x - sign(distance.x)][from.y - sign(distance.y)]);

    if ((abs(distance.x) == 2) && (integ(piece) != rez)) {
        return false;
    }
    if ((integ(piece) == piece) && (sign(piece) != sign(distance.y))) {
        return false;
    }

    return true;
}
//делает ход
function move(from, to) {
    //если моя очередь
    my_turn = true;
    if (legal_move(from, to)) {
        piece = board[from.x][from.y];
        distance = coord(to.x - from.x, to.y - from.y);
        if ((abs(distance.x) == 1) && (board[to.x][to.y] == 0)) {
            swap(from, to);
        } else if ((abs(distance.x) == 2)
            && (integ(piece) != integ(board[from.x + sign(distance.x)][from.y + sign(distance.y)]))) {
            double_jump = false;
            swap(from, to);
            remove(from.x + sign(distance.x), from.y + sign(distance.y));
            //проверка на второй прыжок
            if ((legal_move(to, coord(to.x + 2, to.y + 2)))
                || (legal_move(to, coord(to.x + 2, to.y - 2)))
                || (legal_move(to, coord(to.x - 2, to.y - 2)))
                || (legal_move(to, coord(to.x - 2, to.y + 2)))) {
                double_jump = true;
                message("Вы можете выполнить двойной прыжок или нажать на свою фигуру, чтобы остаться на месте.");
            }
        }
        if ((board[to.x][to.y] == 1) && ((my_color == "white" ? to.y == 7 : to.y == 0))) king_me(to.x, to.y);
        selected = to;
        if (!with_cpu) writeHistory(from, to);
        if (game_over() && !double_jump) {
            if (with_cpu) setTimeout("toggle(" + to.x + "," + to.y + ");my_turn = double_jump = false;computer();", 1000);  //исходный код
            else {
                bridge.server.change(rivalId, from, to);
                bridge.server.next(rivalId);
                setTimeout("toggle(" + to.x + "," + to.y + ");my_turn = double_jump = false;", 500);//комп отключен, ход соперника
            }
        }
        else if (!with_cpu) {
            bridge.server.change(rivalId, from, to);
        }
    }
    return true;
}
function king_me(x, y) {
    if (board[x][y] == 1) {
        board[x][y] = 1.1; // king you
        draw(x, y, my_color == "black" ? "../Images/me2k.gif" : "../Images/you2k.gif");
    } else if (board[x][y] == -1) {
        board[x][y] = -1.1; // king me
        draw(x, y, "../Images/me2k.gif");
    }
}

function swap(from, to) {
    if (my_turn || comp_move) {
        dummy_src = document.images["space" + to.x + "" + to.y].src;
        document.images["space" + to.x + "" + to.y].src = document.images["space" + from.x + "" + from.y].src;
        document.images["space" + from.x + "" + from.y].src = dummy_src;
    }
    dummy_num = board[from.x][from.y];
    board[from.x][from.y] = board[to.x][to.y];
    board[to.x][to.y] = dummy_num;
}
function remove(x, y) {
    if (my_turn || comp_move)
        draw(x, y, "../Images/gray.gif");
    board[x][y] = 0;
}
function Result(val) {
    this.high = val;
    this.dir = new Array();
}
function move_comp(from, to) {
    toggle(from.x, from.y);
    comp_move = true;
    swap(from, to);
    if (abs(from.x - to.x) == 2) {
        remove(from.x + sign(to.x - from.x), from.y + sign(to.y - from.y));
    }
    if ((board[to.x][to.y] == -1) && (my_color == "black" ? to.y == 7 : to.y == 0)) king_me(to.x, to.y);
    setTimeout("selected_c = coord(" + to.x + "," + to.y + ");piece_toggled = true;", 400);
    setTimeout("bak=my_turn;my_turn=false;toggle(" + to.x + "," + to.y + ");my_turn=bak;", 500);
    if (game_over()) {
        //переход хода на меня
        setTimeout("comp_move = false;my_turn = true;togglers=0;", 500);
        message("Хорошо.Ваша очередь.Вы можете сделать свой ход.");
    }
    return true;
}
function game_over() { // make sure game is not over (return false if game is over)
    comp = you = false;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (integ(board[i][j]) == -1) comp = true;
            if (integ(board[i][j]) == 1) you = true;
        }
    }
    if (!comp) {
        message("Вы выиграли!");
        if (!with_cpu)
            bridge.server.gameOver(rivalId, rival_name, true, gameHistory);
    }
    if (!you) {
        message("Вы проиграли!");
        if (!with_cpu)
            bridge.server.gameOver(rivalId, rival_name, false, gameHistory);
    }
    game_is_over = (!comp || !you)
    return (!game_is_over);
}

// the higher the jump_priority, the more often the computer will take the jump over the safe move
var jump_priority = 100;

function computer() {
    //начало хода компа
    // step one - prevent any jumps
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 8; i++) {
            if (integ(board[i][j]) == 1) {
                if ((legal_move(coord(i, j), coord(i + 2, j + 2))) && (prevent(coord(i + 2, j + 2), coord(i + 1, j + 1)))) {
                    return true;
                } if ((legal_move(coord(i, j), coord(i - 2, j + 2))) && (prevent(coord(i - 2, j + 2), coord(i - 1, j + 1)))) {
                    return true;
                }
            } if (board[i][j] == 1.1) {
                if ((legal_move(coord(i, j), coord(i - 2, j - 2))) && (prevent(coord(i - 2, j - 2), coord(i - 1, j - 1)))) {
                    return true;
                } if ((legal_move(coord(i, j), coord(i + 2, j - 2))) && (prevent(coord(i + 2, j - 2), coord(i + 1, j - 1)))) {
                    return true;
                }
            }
        }
    }
    // step two - if step one not taken, look for jumps
    for (var j = 7; j >= 0; j--) {
        for (var i = 0; i < 8; i++) {
            if (jump(i, j))
                return true;
        }
    }
    safe_from = null;
    // step three - if step two not taken, look for safe single space moves
    for (var j = 0; j < 8; j++) {
        for (var i = 0; i < 8; i++) {
            if (single(i, j))
                return true;
        }
    }
    // if no safe moves, just take whatever you can get
    if (safe_from != null) {
        move_comp(safe_from, safe_to);
    } else {
        message("You beat me!!");
        game_is_over = true;
    }
    safe_from = safe_to = null;
    return false;
}
function jump(i, j) {
    if (board[i][j] == -1.1) {
        if (legal_move(coord(i, j), coord(i + 2, j + 2))) {
            move_comp(coord(i, j), coord(i + 2, j + 2));
            setTimeout("jump(" + (i + 2) + "," + (j + 2) + ");", 500);
            return true;
        } if (legal_move(coord(i, j), coord(i - 2, j + 2))) {
            move_comp(coord(i, j), coord(i - 2, j + 2));
            setTimeout("jump(" + (i - 2) + "," + (j + 2) + ");", 500);
            return true;
        }
    } if (integ(board[i][j]) == -1) {
        if (legal_move(coord(i, j), coord(i - 2, j - 2))) {
            move_comp(coord(i, j), coord(i - 2, j - 2));
            setTimeout("jump(" + (i - 2) + "," + (j - 2) + ");", 500);
            return true;
        } if (legal_move(coord(i, j), coord(i + 2, j - 2))) {
            move_comp(coord(i, j), coord(i + 2, j - 2));
            setTimeout("jump(" + (i + 2) + "," + (j - 2) + ");", 500);
            return true;
        }
    }
    return false;
}
function single(i, j) {
    if (board[i][j] == -1.1) {
        if (legal_move(coord(i, j), coord(i + 1, j + 1))) {
            safe_from = coord(i, j);
            safe_to = coord(i + 1, j + 1);
            if (wise(coord(i, j), coord(i + 1, j + 1))) {
                move_comp(coord(i, j), coord(i + 1, j + 1));
                return true;
            }
        } if (legal_move(coord(i, j), coord(i - 1, j + 1))) {
            safe_from = coord(i, j);
            safe_to = coord(i - 1, j + 1);
            if (wise(coord(i, j), coord(i - 1, j + 1))) {
                move_comp(coord(i, j), coord(i - 1, j + 1));
                return true;
            }
        }
    } if (integ(board[i][j]) == -1) {
        if (legal_move(coord(i, j), coord(i + 1, j - 1))) {
            safe_from = coord(i, j);
            safe_to = coord(i + 1, j - 1);
            if (wise(coord(i, j), coord(i + 1, j - 1))) {
                move_comp(coord(i, j), coord(i + 1, j - 1));
                return true;
            }
        } if (legal_move(coord(i, j), coord(i - 1, j - 1))) {
            safe_from = coord(i, j);
            safe_to = coord(i - 1, j - 1);
            if (wise(coord(i, j), coord(i - 1, j - 1))) {
                move_comp(coord(i, j), coord(i - 1, j - 1));
                return true;
            }
        }
    }
    return false;
}
function possibilities(x, y) {
    if (!jump(x, y))
        if (!single(x, y))
            return true;
        else
            return false;
    else
        return false;
}
function prevent(end, s) {
    i = end.x;
    j = end.y;
    if (!possibilities(s.x, s.y))
        return true;
    else if ((integ(board[i - 1][j + 1]) == -1) && (legal_move(coord(i - 1, j + 1), coord(i, j)))) {
        return move_comp(coord(i - 1, j + 1), coord(i, j));
    } else if ((integ(board[i + 1][j + 1]) == -1) && (legal_move(coord(i + 1, j + 1), coord(i, j)))) {
        return move_comp(coord(i + 1, j + 1), coord(i, j));
    } else if ((board[i - 1][j - 1] == -1.1) && (legal_move(coord(i - 1, j - 1), coord(i, j)))) {
        return move_comp(coord(i - 1, j - 1), coord(i, j));
    } else if ((board[i + 1][j - 1] == -1.1) && (legal_move(coord(i + 1, j - 1), coord(i, j)))) {
        return move_comp(coord(i + 1, j - 1), coord(i, j));
    } else {
        return false;
    }
}
function wise(from, to) {
    i = to.x;
    j = to.y;
    n = (j > 0);
    s = (j < 7);
    e = (i < 7);
    w = (i > 0);
    if (n && e) ne = board[i + 1][j - 1]; else ne = null;
    if (n && w) nw = board[i - 1][j - 1]; else nw = null;
    if (s && e) se = board[i + 1][j + 1]; else se = null;
    if (s && w) sw = board[i - 1][j + 1]; else sw = null;
    eval(((j - from.y != 1) ? "s" : "n") + ((i - from.x != 1) ? "e" : "w") + "=0;");
    if ((sw == 0) && (integ(ne) == 1)) return false;
    if ((se == 0) && (integ(nw) == 1)) return false;
    if ((nw == 0) && (se == 1.1)) return false;
    if ((ne == 0) && (sw == 1.1)) return false;
    return true;
}

function refresh() {
    $('#board').remove();
    $('#disp').remove();
    let html = "";
    game_is_over = false;
    //piece_toggled = false;
    BoardClone();
    my_color = "white";
    my_turn = true;
    let b = $('#giveUp');
    html = "<table id='board' border=0 cellspacing=0 cellpadding=0 width=" + (square_dim * 8 + 8)
        + "<tr><td><img src='../Images/black.gif' width=" + (square_dim * 8 + 8)
        + " height=4><br></td></tr>";
    for (var j = 0; j < 8; j++) {
        html += "<tr><td><img src='../Images/black.gif' width=4 height=" + square_dim + ">";

        for (var i = 0; i < 8; i++) {
            if (moveable_space(i, j))
                html += "<a href='javascript:clicked(" + i + "," + j + ")'>";
            html += "<img src='../Images/";
            if (board[i][j] == 1) html += "you1.gif";
            else if (board[i][j] == -1) html += "me1.gif";
            //если прорисовывать все поле то здесь добавить 2 и -2
            else if (moveable_space(i, j)) html += "gray.gif";
            else html += "black.gif";
            html += "' width=" + square_dim + " height=" + square_dim
                + " name='space" + i + "" + j + "' border=0>";
            if (moveable_space(i, j)) html += "</a>";
        }
        html += "<img src='../Images/black.gif' width=4 height=" + square_dim + "></td></tr>";
    }
    html += "<tr><td><img src='../Images/black.gif' width=" + (square_dim * 8 + 8)
        + " height=4><br></td></tr></table>"
        + "<form name='disp' id='disp'><textarea name='message' id='message' style='resize:none;color:#864f07;font-weight:600;' wrap=virtual rows=4 cols=50></textarea><br><input "
        + "type=button id='reload' value='Начать заново' onClick=refresh()><input type=button id='btnWithCpu' class='active' disabled='disabled' value='Игра с компьютером'></form>";
    b.before(html);
    message("Вы можете начать! Выберите белую шашку для перемещения.");
}
//Начало онлайн игры
function inline() {
    
    //обнуляем историю ходов
    gameHistory = "";
    //отключаем все не нужное и включаем все нужное
    let b = $('#btnWithCpu');
    b.removeClass('active');
    message("Игра по сети!Ваш соперник: " + rival_name);
    with_cpu = false;
    $('#reload').prop('disabled', true);
    $('#giveUp').show();
    $('#btnCreateGame').hide();
}
//Конец онлайн игры
function offline() {
    $('#btnWithCpu').addClass('active');
    $('#reload').prop('disabled', false);
    $('#giveUp').hide();
    $('#btnCreateGame').show();
    $('#time').hide();
    clearInterval(interval);
}
//Таймер
function startTimer(duration) {
    duration = duration.split(':');
    duration = parseInt(duration[1]) * 60 + parseInt(duration[2]);
    display = $('#time');
    display.show();

    let timer = duration, minutes, seconds;
    interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            if (my_color == "white") bridge.server.draw(rivalId, rival_name, history += " End of time!");
            return;
        }
    }, 1000);
}
//преобразование хода
function convertStep(cell) {
    let x = cell.x;
    let y = cell.y;
    let step = "";
    if (x == 0) step += "a";
    else if (x == 1) step += "b";
    else if (x == 2) step += "c";
    else if (x == 3) step += "d";
    else if (x == 4) step += "e";
    else if (x == 5) step += "f";
    else if (x == 6) step += "g";
    else if (x == 7) step += "h";
    
    if (y == 0) step += "8";
    else if (y == 1) step += "7";
    else if (y == 2) step += "6";
    else if (y == 3) step += "5";
    else if (y == 4) step += "4";
    else if (y == 5) step += "3";
    else if (y == 6) step += "2";
    else if (y == 7) step += "1";
    return step;
}
//Запись ходов
function writeHistory(from, to) {
    gameHistory += convertStep(from);
    gameHistory += ":";
    gameHistory += convertStep(to);
    gameHistory += "; ";
}
//Приватный чат
bridge.client.onPrivateChat = privateChat;
function privateChat(msg, from) {
    $('#playersChatRoom').append(`<div><b> ${from}: </b> ${msg} </div>`);
}
//Публичны чат
bridge.client.onCorrespondence = commonChat;
function commonChat(from, msg) {
    $('#commonChat').append(`<div><b> ${from}: </b> ${msg} </div>`);
};
//Конец игры
bridge.client.gameOver = function (isWin) {

    rivalId = "";
    rival_name = "";
    with_cpu = true;
    my_turn = true;
    offline();
    if (isWin == null) message("Время вышло! Ничья!");
    else if (isWin) message("Вы победили!");
    else message("Вы проиграли!");
}
//создание приглашения  и события на клик(присоединиться)
//obj - данные приглашаемого
bridge.client.addNewInvitation = addInvitation;
function addInvitation(obj) {
    let color = obj["Color"] == "white" ? "Белый" : "Черный";
    let time = obj["GameTime"];
    let type = obj["Type"] == 1 ? "Классические" : obj["Type"] == 2 ? "Русские" : "Поддавки";
    $('#gamesList').append(`<div class="connecting-list-item">
                    <span>${obj["Creator"]}</span>
                    <a href="#" id="${obj["Hash"]}" title="Цвет соперника : ${color}\nВремя игры        : ${time}\nТип игры             : ${type}" class="connect">играть</a>
                    </div>`);
    let Id = '#' + obj["Hash"];
    $(Id).click((e) => {
        //проверка пользователя
        let is_auth = $('#IsAuthenticated').val();
        if (is_auth === 'true') {
            acceptInvitation(obj, e);
        }
        else document.location.href = '/Account/Login';
    })
};
//Занесение в список приглашений,нового приглашения от кого-то
bridge.client.acceptInvitation = acceptInvitation;
function acceptInvitation(obj, e) {
    refresh();
    my_color = (obj["Color"] == "white") ? "black" : "white";
    my_turn = (my_color == "white");
    rivalId = obj["ConnectionId"];
    with_cpu = false;
    if (my_color == "black")
        boardInvert();
    rival_name = obj["Creator"];
    if (e != null) e.target.parentElement.remove();
    
    inline();
    startTimer(obj["GameTime"]);
    bridge.server.apply(obj);
}
//Получаем id соперника для создания моста и начинаем игру
bridge.client.bridgeBilding = function (inv, rival, nickName) {
    refresh();
    removeInvitation(inv["Hash"])
    rivalId = rival;
    rival_name = nickName;
    my_color = inv["Color"];
    my_turn = (my_color == "white");
    if (my_color == "black")
        boardInvert();
    inline();
    startTimer(inv["GameTime"]);
}
//Передача хода аппоненту
bridge.client.nextTurn = function () {
    my_turn = true;
}
//Передача данных аппоненту о моем ходе
bridge.client.change = function (from, to) {
    move_comp(from, to);
    writeHistory(from, to);
}
//Заполнение списка приглашений и общего чата(подключение нового пользователя)
bridge.client.connected = function (cor, inv) {
    for (var i = 0; i < cor.length; i++) {
        commonChat(cor[i]["Sender"], cor[i]["Message"]);
    }
    for (var i = 0; i < inv.length; i++) {
        addInvitation(inv[i]);
    }
};
//Удаление всех приглашений отключившегося клиента
bridge.client.removeInvitations = function (invs) {
    for (var i = 0; i < invs.length; i++) {
        //$('#' + invs[i]["ConnectionId"]).parent().remove();
        $('#' + invs[i]["Hash"]).parent().remove();
        console.log("удаление в цикле");
    }
}
//Удаление приглашения к которому кто-то подключился
bridge.client.removeInvitation = removeInvitation;
function removeInvitation(removeInvId) {
    let selector = '#' + removeInvId;
    console.log("удаляем  у всех");
    //уточнить
    $(selector).parent().remove();
}

/*******************************************/
$.connection.hub.start().done(function () {
    //отправка сообщения в приватный чат
    $('#btnSend').click(() => {
        let name = $('#NickName').val();
        let msg = $('#inputMessages').val();
        if (rivalId != "") bridge.server.privateChat(msg, rivalId, name);
        else privateChat("Чат будет активен при игре с соперником онлайн!", "Сообщение");

        $('#inputMessages').val("");
    });
    //отправка сообщения в публичный чат
    $('#btnSendCommon').click(() => {
        let el = $('#inputMessagesCom');
        let name = $('#NickName').val();
        let txt = el.val();
        if (txt !== "")
            bridge.server.commonChat(txt, name);
        el.val("");
    });

    //Сдача игры
    $('#giveUp').click(() => {
        offline();
        bridge.server.gameOver(rivalId, rival_name, false, gameHistory);
    })
    //создание нового приглашения
    $('#btnCreateGame').click(() => {
        let is_auth = $('#IsAuthenticated').val();
        if (is_auth === 'true') $('.create-game-box').show();
        else document.location.href = '/Account/Login';
    });
    //Подтверждение создания новой игры
    $('#create').click(() => {
        //проверка данных
        var time = $('input[name=Time]').val();
        //если время игры не в диапазоне - отмена
        var check_time = parseFloat(time.replace(':', "."));
        if (check_time > 15 || check_time < 3) return;

        time = time.split(':');
        var min = time[0];
        var sec = time[1];
        var color = $('input[name=Color]:checked').val();
        var type = $('#Type option:selected').val();
        var autosearch = $('#autoSearch').is(":checked");

        //прячем окно
        $('.create-game-box').hide();
        //передаем на сервер
        bridge.server.createGame(color, min, sec, type, autosearch);
    })
});

message("Вы можете начать! Выберите белую шашку для перемещения.");









