requires "Dancer2"                            => "0.205000";
requires "Dancer2::Plugin::Database"          => "2.17";
requires "Dancer2::Serializer::JSON"          => "0.205002";
requires "Dancer2::Template::TemplateToolkit" => "0.202000";

requires "CGI::Deurl::XS"              => "0.08";
requires "Plack::Middleware::Deflater" => "0";

recommends "YAML"             => "0";
recommends "URL::Encode::XS"  => "0";
recommends "HTTP::Parser::XS" => "0";

on "test" => sub {
  requires "Test::More"            => "0";
  requires "HTTP::Request::Common" => "0";
};

# vim:ts=2:sw=2:sts=2:et:ft=perl
