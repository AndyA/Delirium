#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";


# use this block if you don't need middleware, and only have a single target Dancer app to run here
use Delirium;

Delirium->to_app;

use Plack::Builder;

builder {
    enable 'Deflater';
    Delirium->to_app;
}



=begin comment
# use this block if you want to include middleware such as Plack::Middleware::Deflater

use Delirium;
use Plack::Builder;

builder {
    enable 'Deflater';
    Delirium->to_app;
}

=end comment

=cut

=begin comment
# use this block if you want to include middleware such as Plack::Middleware::Deflater

use Delirium;
use Delirium_admin;

builder {
    mount '/'      => Delirium->to_app;
    mount '/admin'      => Delirium_admin->to_app;
}

=end comment

=cut

