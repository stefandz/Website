$( function () {

    console.log( 'hello' );

    $( 'a[href="mailto:?"]' )
        .attr( 'href', [ 'mailto:r', 'o', 's', 's', null, '@', 'elec', 'tric', 'glen', null, '.com' ].filter( v => v !== null ).join( '' ) );
    
});
