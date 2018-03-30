#!/bin/bash

./setup.sh

function launch {
  local environment=$1
  local port=$2

  plackup                                            \
    -E "$environment"                                \
    -R lib,config.yml,environments/$environment.yml  \
    -s FCGI                                          \
    --nproc 10                                       \
    --port $port                                     \
    bin/app.psgi
}

# vim:ts=2:sw=2:sts=2:et:ft=sh

