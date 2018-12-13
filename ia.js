var IA = {

    /**
     * Joue pour l'IA
     * @param unePartie
     * @param profondeur
     */
    jouer: function (unePartie, profondeur) {
        var tmp;
        var maxCol = [1];
        var max = -10000;
        let row;
        var joueurActif = game.joueurActif;

        for (var col = 1; col <= game.nbColumn; col++) {
            game.joueurActif = joueurActif;
            row = game.placerPiece(col, game.joueurActif);
            if (row > 0) {
                tmp = this.min(unePartie, profondeur-1, joueurActif);
                if (tmp > max) {
                    max = tmp;
                    maxCol = [col];
                } else if (tmp === max) {
                    maxCol.push(col);
                }
                game.retirerPiece(col, row);
            }
        }
        maxCol = maxCol[Math.floor(Math.random() * maxCol.length)];
        game.placerPiece(maxCol, joueurActif, true);
    },

    /**
     *
     * @param partie
     * @param profondeur
     * @returns {*}
     */
    max: function (partie, profondeur, joueurRef) {
        if (profondeur === 0 || this.gagnant(partie) !== "aucun") {
            return this.evaluer(partie, joueurRef);
        }

        var max = -10000;
        let tmp, row;

        for (var col = 1; col <= game.nbColumn; col++) {
            game.joueurActif = joueurRef;
            row = game.placerPiece(col, game.joueurActif);
            if (row > 0) {
                tmp = this.min(partie, profondeur-1, joueurRef);

                if (tmp > max) {
                    max = tmp;
                }
                game.retirerPiece(col, row);
            }
        }
        return max;
    },

    /**
     *
     * @param unePartie
     * @param profondeur
     * @returns {*}
     */
    min: function (unePartie, profondeur, joueurRef) {
        if (profondeur === 0 || this.gagnant(unePartie) !== "aucun") {
            return this.evaluer(unePartie, joueurRef);
        }

        var min = 10000;
        var tmp, row;

        for (var col = 1; col <= game.nbColumn; col++) {
            game.joueurActif = (joueurRef === "player2" ? "player1" : "player2");
            row = game.placerPiece(col, game.joueurActif );
            if (row > 0) {
                tmp = this.max(unePartie, profondeur-1, joueurRef);

                if (tmp < min) {
                    min = tmp;
                }
                game.retirerPiece(col, row);
            }
        }
        return min;
    },

    /**
     * Evalue le poids d'un état de la partie
     * @param unePartie
     * @returns {*}²
     */
    evaluer: function(unePartie, joueurRef) {
        let vainqueur = this.gagnant(unePartie);
        // Si on a un gagnant
        if (vainqueur !== "aucun") {
            if (vainqueur === joueurRef) {
                return 1000;
            } else if (vainqueur === (joueurRef === "player2" ? "player1" : "player2")) {
                return -1000;
            } else {
                return 0;
            }
        }

        // Si on n'a pas de gagnant
        var [player1_2, player2_2] = this.nbSeries(unePartie, 2),
            [player1_3, player2_3] = this.nbSeries(unePartie, 3);

        if (joueurRef === "player2") {
            return (player2_2 + player2_3 * 3) - (player1_2 + player1_3 * 3);
        } else {
            return (player1_2 + player1_3 * 3) - (player2_2 + player2_3 * 3);
        }
    },

    /**
     * Retourne le joueur gagnant (le joueur qui a 4 pions alignés),
     * - "jeu_fini" si le plateau est rempli et qu'aucun joueur n'a gagné
     * - "aucun" si le jeu n'est pas terminé et qu'aucun joueur n'a gagné
     * @param unePartie
     * @returns {string}
     */
    gagnant: function(unePartie) {
        // On compte le nombre de séries de 4 pionq
        var [player1, player2] = this.nbSeries(unePartie, 4);

        if (player1 > 0) {
            return "player1";
        } else if (player2 > 0) {
            return "player2";
        } else {
            if (game.plateauTotalementRempli(unePartie)) {
                return "jeu_fini";
            }
        }
        return "aucun";
    },

    /**
     * Renvoie le nombre de séries de nb pions sur le plateau
     * @param unePartie
     * @param nb
     * @returns {number[]}
     */
    nbSeries: function(unePartie, nb) {
        let nbAlignes1, nbAlignes2, nbSeriesJoueur1, nbSeriesJoueur2;
        nbAlignes1 = nbAlignes2 = nbSeriesJoueur1 = nbSeriesJoueur2 = 0;

        let currentPosition;

        // Verticalement : pour chaque ligne de chaque colonne
        for (let col = 1; col <= game.nbColumn; col++) {
            nbAlignes1 = 0; nbAlignes2 = 0;
            for (let row = 1; row <= game.partie[col].length - 1; row++) {
                currentPosition = unePartie[col][row];
                if (typeof currentPosition === "undefined") {
                    nbAlignes1 = 0; nbAlignes2 = 0;
                } else if (currentPosition === "player1") {
                    nbAlignes1++;
                    // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                    nbAlignes2 = 0;
                    if (nbAlignes1 === nb) {
                        nbSeriesJoueur1++;
                    }
                } else if (currentPosition === "player2") {
                    nbAlignes2++;
                    // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                    nbAlignes1 = 0;

                    if (nbAlignes2 === nb) {
                        nbSeriesJoueur2++;
                    }
                }
            }
        }

        nbAlignes1 = 0; nbAlignes2 = 0; currentPosition = "";

        // Horizontalement : pour chaque colonne de chaque ligne
        for (let row = 1; row <= game.nbRow; row++) {
            nbAlignes1 = 0; nbAlignes2 = 0;
            for (let col = 1; col <= game.nbColumn; col++) {
                currentPosition = unePartie[col][row];
                if (typeof currentPosition === "undefined") {
                    nbAlignes1 = 0; nbAlignes2 = 0;
                } else if (currentPosition === "player1") {
                    nbAlignes1++;
                    // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                    nbAlignes2 = 0;
                    if (nbAlignes1 === nb) {
                        nbSeriesJoueur1++;
                    }
                } else if (currentPosition === "player2") {
                    nbAlignes2++;
                    // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                    nbAlignes1 = 0;

                    if (nbAlignes2 === nb) {
                        nbSeriesJoueur2++;
                    }
                }
            }
        }

        //Diagonale
        for (let col = 1; col <= game.nbColumn; col++) {
            for (let row = 1; row <= game.nbRow; row++) {
                nbAlignes1 = nbAlignes2 = 0;
                currentPosition = unePartie[col][row];
                if (currentPosition === "player1") {
                    nbAlignes1++;
                } else if (currentPosition === "player2") {
                    nbAlignes2++;
                }
                // On compte les pions en diagonales gauche a droite
                if (col !== game.nbColumn && row !== game.nbRow && typeof currentPosition !== "undefined") {
                    var i=col+1, j=row+1;
                    while (i <= game.nbColumn && j <= game.nbRow) {
                        _currentPosition = unePartie[i][j];
                        if (_currentPosition !== currentPosition) {
                            break;
                        } else if (_currentPosition === "player1") {
                            nbAlignes1++;
                            // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                            nbAlignes2 = 0;
                            if (nbAlignes1 === nb) {
                                nbSeriesJoueur1++;
                            }
                        } else if (_currentPosition === "player2") {
                            nbAlignes2++;
                            // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                            nbAlignes1 = 0;

                            if (nbAlignes2 === nb) {
                                nbSeriesJoueur2++;
                            }
                        }
                        i++;j++;
                    }
                }
            }
        }

        //Anti diagonale
        for (let col = 1; col <= game.nbColumn; col++) {
            for (let row = 1; row <= game.nbRow; row++) {
                nbAlignes1 = nbAlignes2 = 0;
                currentPosition = unePartie[col][row];
                if (currentPosition === "player1") {
                    nbAlignes1++;
                } else if (currentPosition === "player2") {
                    nbAlignes2++;
                }
                // On compte les pions en diagonales gauche a droite
                if (col !== 1 && row !== game.nbRow && typeof currentPosition !== "undefined") {
                    var i=col-1, j=row+1;
                    while (i >= 1 && j <= game.nbRow) {
                        _currentPosition = unePartie[i][j];
                        if (_currentPosition !== currentPosition) {
                            break;
                        } else if (_currentPosition === "player1") {
                            nbAlignes1++;
                            // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                            nbAlignes2 = 0;
                            if (nbAlignes1 === nb) {
                                nbSeriesJoueur1++;
                            }
                        } else if (_currentPosition === "player2") {
                            nbAlignes2++;
                            // On remet le nbAlignes de l'autre joueur à 0 car sa série a été coupée
                            nbAlignes1 = 0;

                            if (nbAlignes2 === nb) {
                                nbSeriesJoueur2++;
                            }
                        }
                        i--;j++;
                    }
                }
            }
        }

        return [nbSeriesJoueur1, nbSeriesJoueur2];
    },
};