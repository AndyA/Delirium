package Delirium;
use Dancer2;
use JSON ();

our $VERSION = '0.1';

#set serializer => 'JSON';

get '/' => sub {
  template 'index' => { 'title' => 'Delirium' };
};

get '/fever/' => sub {
  my $qp = request->query_parameters;
  debug "get query: ", join ", ", $qp->keys;
  return JSON->new->encode( { api_version => 1, auth => 1 } );
};

post '/fever/' => sub {
  my $qp    = request->query_parameters;
  my $parms = request->body_parameters;

  debug "post query: ", join ", ", $qp->keys;
  debug "post args: ",  join ", ", $parms->keys;

  my $resp = { api_version => 2, auth => 1 };

  if ( exists $qp->{groups} ) {
    $resp->{groups} = [
      { id    => 1,
        title => "Tech News"
      }
    ];
  }

  if ( exists $qp->{feeds} ) {
    $resp->{feeds} = [
      { id              => 1,
        title           => "The Register",
        favicon_id      => 3,
        url             => "https://www.theregister.co.uk/headlines.rss",
        site_url        => "https://www.theregister.co.uk/",
        is_spark        => 0,
        last_updated_on => time()
      },
      { id              => 2,
        title           => "Slashdot",
        favicon_id      => 4,
        url             => "http://rss.slashdot.org/Slashdot/slashdotMain",
        site_url        => "https://slashdot.org/",
        is_spark        => 0,
        last_updated_on => time()
      },
    ];
  }

  if ( exists $qp->{groups} || exists $qp->{feeds} ) {
    $resp->{feeds_group} = [
      { group_id => 1,
        feed_ids => "1,2",
      }
    ];
  }

  if ( exists $qp->{favicons} ) {
    $resp->{favicons} = [
      { id => 3,
        data =>
         "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABqlBMVEX///9NTU1SUlJPT09QUFBMTExLTExLS0tGRkZCRERDRERFRkZGR0c2NzctLi4zNDQ7OztBQkIwMTE6OzoxMjIuLy8vMDAoKiooKiklJiUjJCMkJSQoKSkZGhohIiImJyYcHR0WFxcgIiEKCgoKCwsVFhUXGBcPEBACAgIBAQEICAgREhJRUVFUVFRUVFRUVFRUVFRUVFRTU1NNTU1QUFBQUVFPT09LTExLTExLTExLS0tFRkZFRkZFRkZFRkZGR0c/QD9AQUFBQUBAQEA/QEBAQUE3ODg4OTk4OTk4OTk5Ojk5OjoyMzMxMjIxMjIyMjMyMzM0NTUuLy8xMjIqKysrLCwqLCwqLCwpKysrLCwuLy8kJSUkJSUkJSUmJyYmJyckJSUjJCQgIiEkJSQkJSUnKSkdHh4dHh4hIiIeICAcHh4cHh4dHh4cHh4gISEVFhYUFhYWFhYVFhYYGhoODw8NDQ0PEBANDg4NDg4REhIMDQ0FBQUDAwMJCQkEBQUJCQlUVFRQUVFLTExFRkZAQEA5OjkyMzMrLCwqLCwkJSUcHh4VFhYNDg7///+ESIEmAAAAgHRSTlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR51f74uSkBo74EU/76JZLS6/kkoMtU+NMHW94rL/15BXTR5ewcGEJJ/O6iRHAS1eusbTr2hB2XmxD9jhsI5fL4rwrxr5alBXu4G+KhBQF8QD2PBeKZg/IAAAABYktHRACIBR1IAAAAB3RJTUUH4gMeEwMMXMVIlAAAANFJREFUGNNjYCAIGIFAR1dPv8HA0IgJCEACxiaNYGBqxszMwsDKymbe1GTRBASWVuysHAycXNzWzTa2zUBgZ8/DzcvAxy/g4Ojk3AIELq6C/EJAATd3D0+vViDwFhYR9WHg821r8/NvA4KAQDHxoGCGkND29vaOMCAZLiEZERnFEN3ZGRMbF5/Q2ZmYlJySKsrQlZaeISWdmdXVlZ2TmycjypBfICsnr6BY2N3dXVSsBBQoKVVWUVVTLyvvqaiUBQlUVddoaGqpq9fW1WuDBdABAJRqO4BOsub8AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTAzLTMwVDE4OjAzOjEyKzAxOjAw/ERbKAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0zMFQxODowMzoxMiswMTowMI0Z45QAAAAASUVORK5CYII="
      },
      { id => 4,
        data =>
         "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAMFBMVEXE09MwYmITYWErXl4agYEQVFQOX1+Hq6sSSUj///93kZCmvb0OQkJNeHgKNDQmSkp6OU8TAAAAAWJLR0QJ8dml7AAAAAd0SU1FB+IDHhMDMQStBIUAAAB2SURBVAjXY2BUAgMBBhMXMHBmCEoDAyWGsLS0pPLCtDSG1tDQ8JlTQyNADM2ZSyGMnRNCgYwTHY0z53Z09AAZDTN3gBhnztycabNc5gyQwTn97EyeMwxvTs2cD2ScY3hznGHNmdUy5xjeQQHDPwj9noEfwvgAADaVRTjQ/n26AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTAzLTMwVDE4OjAzOjQ5KzAxOjAwtqMBtgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0zMFQxODowMzo0OSswMTowMMf+uQoAAAAASUVORK5CYII="
      }
    ];
  }

  if ( exists $qp->{items} ) {
    $resp->{items} = [
      { id              => 1,
        feed_id         => 1,
        title           => "Something about technology",
        author          => 'andy@hexten,net',
        html            => "<h1>Technology</h1><p>It's great...</p>",
        url             => "https://www.theregister.co.uk/tech",
        is_saved        => 0,
        is_read         => 0,
        created_on_time => time() }
    ];
    $resp->{total_items} = 1;
  }

  if ( exists $qp->{links} ) {
    $resp->{links} = [];
  }

  if ( exists $qp->{unread_item_ids} ) {
    $resp->{unread_item_ids} = "1";
  }

  if ( exists $qp->{saved_item_ids} ) {
    $resp->{saved_item_ids} = "";
  }

  return JSON->new->encode($resp);
};

true;
