/*
A browser-based crossword puzzle implemented in JavaScript

https://github.com/itsrimzz/crossword-js

*/
var arr =[];
function Crossw1rd(container_id) {

  this.container; // container for the grid
  this.width = 0; // how many cells wide
  this.height = 0; // how many cells high
  this.clues; // data used to populate puzzle
  this.cells = []; // 2 dim array of cells in grid [y][x]
  this.grid;
  this.direction = 'A'; // A=across, D=down
  this.id = 'puzzle'; // puzzle identifier - gets set in init
  this.saved = true; // gets set to false when answers have changed
  this.autosave = true;
  var self = this;


  // initializer
  this.init = function(id) {
    var c = $("#"+container_id);
    c.empty();
    this.id = id; 
    this.container = $('<div class="crossw1rd"></div>').appendTo(c);
    this.populateClues(function() {
			self.initDimensions();
			self.drawClues();
			self.drawGrid();
			self.drawControls();
			self.adjustDimensions();
			self.mapKeyBindings();
			// check for & load saved state
			var state = $.cookie('crossw1rd.'+id);
			if (state!=null) self.resume(state);
			// turn on autosave
			if (self.autosave) {
				setInterval(self.save, 1000);
			}
    });
  }

  // populate the array of clues - must be in word number order
  this.populateClues = function(continueInit) {
  	var idre = new RegExp('[0-9a-zA-Z]+');
  	if (!idre.test(this.id)) alert('Invalid ID');
        run();    
		  	//self.puzzle = data;
		  	self.clues = arr;
		  	continueInit();
        
		  }

  // establish puzzle dimensions
  this.initDimensions = function() {
    for (var i=0; i<this.clues.length; i++) {
      var c = this.clues[i];
      if (c.d=='A' && (c.x + c.a.length)>this.width) this.width = c.x + c.a.length;
      if (c.d=='D' && (c.y + c.a.length)>this.height) this.height = c.y + c.a.length;
    }
  }

  // draw the grid
  this.drawGrid = function() {
    // create grid container
    this.grid = $('<div class="grid"></div>').appendTo(this.container);

    // set height and width
    this.grid.attr('style','height:'+(this.height*28)+'px; width:'+(this.width*28)+'px;');
    
    // add rows and cols and store cells in this.cells
    this.cells = [];
    for (var r=0; r<this.height; r++) {
      var row = $('<div class="row"></div>').appendTo(this.grid);
      this.cells[r] = [];
      for (var c=0; c<this.width; c++) {
        var cell = $('<div class="blank"></div>').appendTo(row);
        this.cells[r][c] = cell;
      }
    }
    
    // populate letters
    for (var i=0; i<this.clues.length; i++) {
      //  { d:'A|D', n:1, x:3, y:2, a:'RAN', c:'Operated' },
      var clue = this.clues[i];
      var x = clue.x; var y = clue.y;
      var cell = this.cells[y][x];
      // this is the first letter, add the word number
      if (cell.find('.num').length==0) {
        $('<span class="num">'+clue.n+'</span>').prependTo(cell);
      }
      cell.addClass((clue.d=='A'?'across':'down')+clue.n);
      // add all the letters in the word
      for (var c=0; c<clue.a.length; c++) {
        if (clue.d=='A') cell = this.cells[y][x+c];
        else if (clue.d=='D') cell = this.cells[y+c][x];
        cell.removeClass('blank');
        var char = clue.a[c].toUpperCase();
        cell.data('a',char); // store the answer for this cell
        if (cell.find('.letter').length==0) {
          $('<span class="letter"></span>').appendTo(cell);
        }
      }
    }
  }
  
  // draw clues
  this.drawClues = function() {
    var cluediv = $('<div class="clues"></div>').appendTo(this.container);
    cluediv.append('<h4 class="cluelabel">Across</h4>');
    var aol = $('<div class="across scroll-pane"></div>').appendTo(cluediv);
    cluediv.append('<h4 class="cluelabel">Down</h4>');
    var dol = $('<div class="down scroll-pane"></div>').appendTo(cluediv);
    for (var i=0; i<this.clues.length; i++) {
      var clue = this.clues[i];
      var li;
      if (clue.d=='A') {
        li = $('<p></p>').appendTo(aol);
      }
      else {
        li = $('<p></p>').appendTo(dol);
      }
      li.addClass('c'+clue.d+clue.n);
      li.text(clue.n + '. ' + clue.c);
      li.data('clueix',i);
      li.click(this.clue_click);
    }
  }

  // handle click of a clue
  this.clue_click = function(ev) {
    var clicked = $(this);
    var clue = self.clues[clicked.data('clueix')];
    self.direction = clue.d;
    var cell = self.cells[clue.y][clue.x];
    cell.click();
    self.activateClue(clicked);
  }
  this.activateClue = function (li) {
    self.container.find('.active_clue').removeClass('active_clue');
    li.addClass('active_clue');
    var paddingMarginOffset = 8;
    var top = li.position().top - li.parent().position().top - paddingMarginOffset;
    self.container.find('.clues ' + 
          (self.direction=='A'?'.across':'.down')
        ).scrollTop(top);
  }

  // draw controls
  this.drawControls = function() {
    var div = $('<div class="controls"></div>').appendTo(this.container);
    var reset = $('<button>Reset</button>').appendTo(div);;
    reset.click(this.reset);
  }

  // set container dimensions based on grid size
  this.adjustDimensions = function() {
    var clueW = 200;
    var padding = 20;
    var h = this.grid.height(); 
    var w = this.grid.width();
    var ctrlH = this.container.find('.controls').height();
    this.container.width(w+padding+clueW);
    this.container.height(h+6+ctrlH);
    this.container.find('.clues').width(clueW);
    this.container.find('.clues').height(h);
    var labelh = $(".clues h4").height();
    $(".clues .across, .clues .down").height((h/2)-(labelh*2));
  }

  /*** NAVIGATION & ENTRY ***/

  // get the cell to the left
  this.cellLeft = function(cell, sameWord, includeBlanks) {
    while (true) {
      cell = cell.prev();
      if (cell.length==0) return cell;
      if (!cell.hasClass('blank') || includeBlanks) return cell;
      if (cell.hasClass('blank') && sameWord) return $();
    }
  }

  // get the cell to the right
  this.cellRight = function(cell, sameWord, includeBlanks) {
    while (true) {
      cell = cell.next();
      if (cell.length==0) return cell;
      if (!cell.hasClass('blank') || includeBlanks) return cell;
      if (cell.hasClass('blank') && sameWord) return $();
    }
  }

  // get the cell above
  this.cellAbove = function(cell, sameWord, includeBlanks) {
    var ix = cell.index();
    while (true) {
      cell = cell.parent().prev();
      if (cell.length==0) return cell;
      cell = cell.children(':eq('+ix+')');
      if (!cell.hasClass('blank') || includeBlanks) return cell;
      if (cell.hasClass('blank') && sameWord) return $();
    }
  }

  // get the cell below
  this.cellBelow = function(cell, sameWord, includeBlanks) {
    var ix = cell.index();
    while (true) {
      cell = cell.parent().next();
      if (cell.length==0) return cell;
      cell = cell.children(':eq('+ix+')');
      if (!cell.hasClass('blank') || includeBlanks) return cell;
      if (cell.hasClass('blank') && sameWord) return $();
    }
  }

  // return the number of the current word given a letter cell
  this.wordNumber = function(cell) {
    var num;
    if (this.direction=='A') {
      var firstLetter=cell;
      while ((cell=this.cellLeft(cell,true)).length>0) {
        firstLetter = cell;
      }
      num= firstLetter.find('.num').text();
    }
    else if (this.direction=='D') {
      var firstLetter = cell;
      while ((cell=this.cellAbove(cell,true)).length>0) {
        firstLetter = cell;
      }
      num = firstLetter.find('.num').text();
    }
    return num;
  }

  // return the cell of the first letter of the next word given a current word number
  this.nextWord = function(curWordNum) {
    for (var i=0; i<this.clues.length; i++) {
      var c = this.clues[i];
      if (c.d==this.direction && c.n > curWordNum) {
        var nextWord = this.grid.find('.'+(this.direction=='D'?'down':'across')+c.n);
        return nextWord;
      }
    }
    // get first word
    return this.nextWord(0);
  }

  // return the cell of the first letter of the previous word given a current word number
  this.prevWord = function(curWordNum) {
    for (var i=this.clues.length-1; i>=0; i--) {
      var c = this.clues[i];
      if (c.d==this.direction && c.n < curWordNum) {
        var prevWord = this.grid.find('.'+(this.direction=='D'?'down':'across')+c.n);
        return prevWord;
      }
    }
    // get last word
    return this.prevWord(Number.MAX_VALUE);
  }

  // activate a cell & set current word
  this.activateCell = function(cell, changedDir) {
    this.grid.find(".row > div").removeClass('active');
    this.grid.find(".row > div").removeClass('word');
    cell = $(cell);
    cell.addClass('active');
    cell.addClass('word');
    if (this.direction=='A') {
      var prev = cell;
      while ((prev = this.cellLeft(prev, true)).length>0) {
        prev.addClass('word');
      }
      var next = cell;
      while ((next = this.cellRight(next, true)).length>0) {
        next.addClass('word');
      }
    }
    if (this.direction=='D') {
      prev = cell;
      while ((prev = this.cellAbove(prev, true)).length>0) {
        prev.addClass('word')
      }
      next = cell;
      while ((next = this.cellBelow(next, true)).length>0) {
        next.addClass('word')
      }
    }
    // change direction if we're not in a word
    if (this.grid.find('.word').length==1 && typeof changedDir=='undefined') {
      this.direction = this.direction=='A'?'D':'A';
      this.activateCell(cell, true);
    }
    else {
      // select clue
      var wordNum = this.wordNumber(cell);
      var ol;
      if (this.direction=='A') ol = this.container.find(".clues .across");
      else ol = this.container.find(".clues .down");
      var li = ol.find('p.c'+this.direction+wordNum);
      this.activateClue(li);
    }
  }

  // key bindings
  this.mapKeyBindings = function() {
    // the current Crossw1rd instance

    // activate cell on click
    this.grid.find(".row > div").click(function(ev) {
      if (!$(this).hasClass('blank')) {
        self.activateCell(this);
      }
    });

    // alphanumeric 
    for (var i=48; i<=90; i++) {
      //   numbers (48-57)         letters (65-90)
      if ((i >= 48 && i <= 57) || (i>=65 && i<= 90)) {
        $(document).bind('keypress', String.fromCharCode(i), function(e) {
          // insert the character
          var c = String.fromCharCode(Crossw1rd.keyCode(e)).toUpperCase();
          var active = self.grid.find('.active');
          active.children('.letter').text(c);
          self.saved = false;
          // move to the next cell
          var next;
          if (self.direction=='A') {
            next = self.cellRight(active,true);
          } else {
            next = self.cellBelow(active,true);
          }
          if (next.length>0) next.click();
          return false;
        });
      }
    }

    // arrow keys - left
    $(document).bind('keydown', 'left', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c = c.prev();
      while (true) {
        if (c.length==0) return false;
        if (c.hasClass('blank')) {
          c = c.prev();
          continue;
        }
        c.click();
        return false;
      }
    });
    // arrow keys - right
    $(document).bind('keydown', 'right', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c = self.cellRight(c);
      if (c.length>0) c.click();
      return false;
    });
    // arrow keys - up
    $(document).bind('keydown', 'up', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c = self.cellAbove(c);
      if (c.length>0) c.click();
      return false;
    });
    // arrow keys - down
    $(document).bind('keydown', 'down', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c = self.cellBelow(c);
      if (c.length>0) c.click();
      return false;
    });
    // backspace - clear current cell and move left within current word
    $(document).bind('keydown', 'backspace', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c.find('.letter').text('');
      self.saved = false;
      c.removeClass('incorrect');
      c.removeClass('correct');
      c = self.cellLeft(c);
      if (c.length>0) c.click();
    });
    // delete - clear current cell
    $(document).bind('keydown', 'del', function() {
      var c = self.grid.find(".active");
      if (c.length==0) return;
      c.find('.letter').text('');
      self.saved = false;
      c.removeClass('incorrect');
      c.removeClass('correct');
    });
    // space - change current direction
    $(document).bind('keydown', 'space', function() {
      self.direction = self.direction=='A'?'D':'A';
      var active = self.grid.find('.active');
      if (active.length>0) self.activateCell(active[0]);
    });
    // tab - next word
    $(document).bind('keydown', 'tab', function() {
      var cell = self.grid.find('.active');
      var curWordNum = self.wordNumber(cell);
      var nextWord = self.nextWord(curWordNum);
      self.activateCell(nextWord);
      return false;
    });
    // shift+tab - prev word
    $(document).bind('keydown', 'shift+tab', function() {
      var cell = self.grid.find('.active');
      var curWordNum = self.wordNumber(cell);
      var prevWord = self.prevWord(curWordNum);
      self.activateCell(prevWord);
      return false;
    });
    // ctrl+shift+l - check letter
    $(document).bind('keydown', 'ctrl+shift+l', function() {
      self.checkCell();
    });
    // ctrl+shift+w - check word
    $(document).bind('keydown', 'ctrl+shift+w', function() {
      self.checkWord();
    });
    // ctrl+shift+a - check puzzle
    $(document).bind('keydown', 'ctrl+shift+a', function() {
      self.checkPuzzle();
    });
  }
  
  /*** ANSWER CHECKING ***/

  // check the correctness of the active cell
  this.checkCell = function(cell) {
    if (typeof cell == 'undefined') cell = this.grid.find('.active');
    var entered = cell.find('.letter').text();
    if (entered=='') return;
    if (cell.data('a')==entered) {
      cell.addClass('correct');
      cell.removeClass('incorrect');
    } 
    else {
      cell.removeClass('correct');
      cell.addClass('incorrect');
    }
  }
  
  // check the correctness of the current word
  this.checkWord = function() {
    var cell = this.grid.find('.active');
    var wordNum = this.wordNumber(cell);
    for (var i=0; i<this.clues.length; i++) {
      var clue = this.clues[i];
      if (clue.d==this.direction && clue.n==wordNum) {
        for (var c=0; c<clue.a.length; c++) {
          if (clue.d=='A') {
            this.checkCell(this.cells[clue.y][clue.x+c]);
          } else {
            this.checkCell(this.cells[clue.y+c][clue.x]);
          }
        }
        break;
      }
    }
  }

  // check the correctness of the whole puzzle
  this.checkPuzzle = function() {
    for (var y=0; y<this.cells.length; y++) {
      var row = this.cells[y];
      for (var x=0; x<row.length; x++) {
        this.checkCell(row[x]);
      }
    }
  }

  /*** SAVE AND RESTORE PUZZLE STATE ***/

  // return serialized state of the current puzzle
  // this weird format is used over something like JSON for compactness as the state is intended to be stored in browser cookies
  this.getState = function() {
    var delim = '|';
    var state = [delim]; // 1st char defines the row delimiter
    state.push(this.id); // then the puzzle id
    state.push(delim); 
    state.push(0); // the number of additional settings stored in the state (for future use, e.g. timer value)
    state.push(delim); 
    //state.push('name=val'); // use this format for additional settings
    for (var i=0; i<this.cells.length; i++) {
      var row = this.cells[i];
      for (var c=0; c<row.length; c++) {
        var cell = row[c];
        if (!cell.hasClass('blank')) {
          var letter = cell.find('.letter').text();
          if (letter.length==0) {
            state.push(' '); // space indicates empty cell
          } 
          else if (letter.length>1) {
            throw 'Multiple characters found in cell ['+i+']['+c+']';            
          } 
          else {
            state.push(letter);
          }
        }
      }
      state.push(delim); // delim between each row
    }
    return state.join('');
  }

  // load the puzzle and populate answers from serialized puzzle state
  this.resume = function(state) {
    var delim = state[0];
    var parts = state.split(delim);
    parts.shift(); // drop the 1st delimeter
    var id = parts.shift(); // get the ID
    var settingslen = parts.shift(); // the number of settings
    var settings = {};
    // convert settings to an object
    for (var i=0; i<settingslen; i++) {
      var setting = parts.shift();
      var setting = setting.split('=');
      settings[setting[0]] = setting[1];
    }
    //this.init(id); // assume this has been done already 
    if (this.id!=id) return; // should not happen
    // set the answers stored in state
    for (var i=0; i<this.cells.length; i++) {
      var row = this.cells[i];
      var answers = parts.shift().split('');
      for (var c=0; c<row.length; c++) {
        var cell = row[c];
        if (!cell.hasClass('blank')) {
          var letter = answers.shift();
          if (letter != ' ') {
            cell.find('.letter').text(letter);
          }
        }
      }
    }
  }

  // save the puzzle state to a cookie
  this.save = function() {
    if (!self.saved) {
      $.cookie('crossw1rd.'+self.id, self.getState(), {expires:365});
      self.saved = true;
    }
  }

  // clear the puzzle and delete saved state
  this.reset = function() {
    if (confirm('Reset: Are you sure?')) {
      $.removeCookie('crossw1rd.'+self.id);
      self.init(self.id);
    }
  }

}

/*** STATIC CLASS FUNCTIONS ***/

// cross-browser keyCode of keypress event
Crossw1rd.keyCode = function(e) { 
  return (e.keyCode ? e.keyCode : e.charCode);
}

///


var GRID_SIZE = 25;
var HORIZONTAL_BOXES = 12;
var VERTICAL_BOXES = 12;
var RUN_PROFILER = false;
var REVEAL_LETTERS = 0;

var GRID_WIDTH = GRID_SIZE * HORIZONTAL_BOXES;
var GRID_HEIGHT = GRID_SIZE * VERTICAL_BOXES;


function finalObject(d, n, x, y, c) {
    this.d = d;
    this.n = n;
    this.x = x;
    this.y = y;
    this.c = c;
}


function LoadSampleData(){
    $('#txtWords').val(
        'jumper,keeps you warm in winter\n' + 
        'jeans,usually faded blue\n' +
        'skirt,women wear these over their legs\n' + 
        'trousers,men wear these over their legs\n' +
        'socks,worn on the feet\n' +
        'shoes,usually have laces\n' +
        'shirt,worn on the body and usually has buttons\n' +
        'hat,keeps your head warm\n' +
        'gloves,normally only worn when it is very cold to protect your hands\n'
        );
}

function run(){

    xWords.Reset();

    
    // GENERATE ARRAY OF WORDS TO PUT INTO THE CANVAS
    
    var aValues = rawData.split('\n');

    var randIndexes = randRange(0,aValues.length-1);

    var wlist = [];

    for(i=0;i<9;i++){
      wlist.push(aValues[randIndexes[i]]);
    }

    console.log(randIndexes);

    // GET THE CROSSWORD 
    
    var crossword = xWords.Create(
        VERTICAL_BOXES,
        HORIZONTAL_BOXES,
        wlist);

    
    var tempObject;
    var d;
    Qlist = xWords.GetQuestionList();
    for (i=0;i<Qlist.length;i++){
        //console.log(Qlist[i]);
        if(Qlist[i].d == 1){
            d = 'A';
        }
        else
            d='D';
        tempObject = new finalObject(d,Qlist[i].num,Qlist[i].x,Qlist[i].y,Qlist[i].clue);
        arr.push(tempObject);
    }



    var temp;
    var answers=[];
    var clues=[];
    for (i=0;i<aValues.length;i++){
            temp = aValues[i].split(',');
            answers.push(temp[0]);
            clues.push(temp[1]);
    }

    for (i=0;i<arr.length;i++){
        //console.log(clues[i]+','+answers[i]);
        for(j=0;j<clues.length;j++){
            if(arr[i].c == clues[j])
                arr[i].a = answers[j];
        }

    }

        console.log(arr);

}

function randRange(min, max) {
  var result = [];
  for (var i=min; i<=max; i++) result.push(i);
  return result.map(function(v){ return [Math.random(), v] })
    .sort().map(function(v){ return v[1] });
}



