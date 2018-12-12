;(function ($) {
    var oAddClass = $.fn.addClass;
    $.fn.addClass = function () {
        for (var i in arguments) {
            var arg = arguments[i];
            if ( !! (arg && arg.constructor && arg.call && arg.apply)) {
                setTimeout(arg.bind(this));
                delete arguments[i];
            }
        }
        return oAddClass.apply(this, arguments);
    }

})(jQuery);

var game = {
    nbColumn: 7,
    nbRow: 6,
    plateau: [],
    partie: [],
    joueurActif: 'player1',
    nbPointP1: 0,
    nbPointP2: 0,
    profondeur: 5,


    /**
     * Initialise la pertie
     */
    init: function () {
        // Réinitialisation des paramètres de la partie
        game.joueurActif = 'player1';
        game.plateau = [];
        game.partie = [];

        // Réinitialisation du nombre de points
        game.setNbPoints(0,0);

        // Construction du plateau
        game.construirePlateau();

        // Enregistrement des évènements
        game.bindColumn();
    },

    /**
     * Gère l'affichage sur le hover et ajoute une pièce au clic
     */
    bindColumn: function() {
        $('.column').click(function () {
            game.placerPiece($(this).attr('id'), game.joueurActif, true);
        }).hover(
            function() {
                var row = game.getLastFreeRowPosition($(this).attr('id'));
                if (row > 0 && game.joueurActif === 'player1') $("#" + $(this).attr('id') + "_" + row).addClass(game.joueurActif + 'Hover');
            },
            function() {
                var row = game.getLastFreeRowPosition($(this).attr('id'));
                if (row > 0 && game.joueurActif === 'player1') $("#" + $(this).attr('id') + "_" + row).removeClass(game.joueurActif + 'Hover');
            });
    },

    /**
     * Set le nombre de points pour chaque joueur
     * @param nbPointP1
     * @param nbPointP2
     */
    setNbPoints: function(nbPointP1, nbPointP2) {
        game.nbPointP1 = nbPointP1 === undefined ? game.nbPointP1 : nbPointP1;
        game.nbPointP2 = nbPointP2 === undefined ? game.nbPointP2 : nbPointP2;
        $('#points').html('<p>' +
            '<span class="player1">Joueur 1 (' + game.nbPointP1 + ')</span> - ' +
            '<span class="player2">Joueur 2 (' + game.nbPointP2 + ')</span>' +
        '</p>');
    },

    /**
     * Construit le plateau avec le bon nombre de colonnes et de lignes
     */
    construirePlateau: function () {
        var elemPlateau = $('#plateau');
        elemPlateau.empty();
        for (var col = 1; col <= game.nbColumn; col++) {
            game.plateau[col] = [];
            game.partie[col] = [];
            var elemeCol = $('<div class="column" id="' + col + '"></div>');
            for (var row = game.nbRow; row >= 1; row--) {
                var elem = $('<div class="row" id="' + col + '_' + row + '"></div>');
                elemeCol.append(elem);
                game.plateau[col][row] = elem;
            }
            elemPlateau.append(elemeCol);
        }
    },

    /**
     * Met à jour l'affichage du plateau à partir de la partie
     * @param unePartie
     */
    majPlateau: function(unePartie) {
        for (let col = 1; col <= game.nbColumn; col++) {
            for (let row = 1; row <= game.nbRow; row++) {
                let currentPosition = unePartie[col][row];
                if (typeof currentPosition !== "undefined") {
                    $("#" + col + "_" + row).addClass(currentPosition);
                    $(".row").removeClass("player1Hover player2Hover");
                }
            }
        }
    },

    /**
     * Place une pièce dans la colonne 'col' pour le joueur 'joueur'
     * Si 'render' est vrai, alors on met à jour l'affichage et on vérifie s'il existe un gagant
     * @param col
     * @param joueur
     * @param render
     */
    placerPiece: function (col, joueur, render = false) {
        var row = this.getLastFreeRowPosition(col);
        if (row > 0) {
            //On remplit le tableau de la partie
            this.partie[col][row] = joueur;
            if (render) {
                this.majPlateau(game.partie);
                // Vérification du cas de victoire
                var gagnant = IA.gagnant(this.partie);
                if(gagnant === "player1" || gagnant === "player2")
                    game.victoire();
                else
                    game.switchActif();
            }
        }
        return row;
    },

    /**
     * Retire la pièce de coordonnées 'col' et 'row'
     * @param col
     * @param row
     */
    retirerPiece: function (col, row) {
        //var row = game.getLastFreeRowPosition(col);
        if (row > 0) {
            //On supprimer le dernier élément de tableau de la partie
            game.partie[col].splice(row, 1);
        }
    },

    /**
     * Renvoie le numéro de la dernière position libre d'une colonne
     * @param col
     * @returns {*}
     */
    getLastFreeRowPosition: function(col) {
        var length = this.partie[col].length;
        if (length >= game.nbRow + 1) return false;
        return length === 0 ? 1 : length;
    },

    /**
     * Change le joueur actif
     * Si c'est au tour de l'IA, alors on la fait jouer
     */
    switchActif: function() {
        if (game.joueurActif === 'player1') {
            game.joueurActif = 'player2';
            IA.jouer(this.partie, this.profondeur);
        } else {
            game.joueurActif = 'player1';
        }
    },

    /**
     * Lance la victoire du joueur courant
     */
    victoire: function () {
        // todo : supprimer
        alert('victoire');
        $('.column').unbind();
        if (game.joueurActif === 'player1')
            game.nbPointP1++;
        else
            game.nbPointP2++;
        game.setNbPoints();
        // todo : décommenter
        //game.confirmNouvelleManche();
    },

    /**
     * Pour lancer une nouvelle manche
     */
    confirmNouvelleManche: function () {
        if (confirm('Victoire ' + game.joueurActif + '\nCommencer une nouvelle manche ?')) {
            $('#plateau').unbind('click').find('.row.player1,.row.player2').removeClass('player1 player2');
            game.bindColumn();
            game.switchActif();
        } else {
            $('#plateau').unbind('click').click(game.confirmNouvelleManche);
        }
    },

    /**
     * Renvoie true si le plateau est totalement rempli
     * @param unePartie
     * @returns {boolean}
     */
    plateauTotalementRempli: function(unePartie) {
        var nbColRemplies = 0;
        for (var col=1; col <= game.nbColumn; col++) {
            // Si la dernière ligne est remplit alors la colonne est remplit
            nbColRemplies += (unePartie[col].length - 1 === game.nbRow ? 1 : 0);
        }
        return nbColRemplies === game.nbColumn;
    },
};

$(document).ready(function () {
    game.init();
});
