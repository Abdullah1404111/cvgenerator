@extends('layouts.admin_app')


@section('content')

<div class="h3 text-center">
   Auctions table
</div>
<div class="table-responsive">
  <table class="table aiz-table mb-0 table-bordered table-hover">
    <thead>
      <tr>
        <th data-breakpoints="">#</th>
        <th data-breakpoints="">Product Name</th>
        <th data-breakpoints="">Image</th>
        <th data-breakpoints="">Initial Price</th>
        <th>Sold At</th>
        <th>Winner</th>
        <th data-breakpoints="">Start time</th>
        <th data-breakpoints="">End time</th>
        <th data-breakpoints="">Actions</th>
      </tr> 
    </thead>
    <tbody>
      @foreach($auctions as $auction)
      <tr>
        <td>{{ $loop->iteration }}</td>
        <td>{{ $auction->product->name }}</td>
        <td><img src='<?php echo "images/products/".$auction->product->image; ?>' alt="Product_image" width="100" class="img-thumbnail"></td>
        <td>{{ $auction->product_init_price }}</td>
        @if($auction->bidders->isEmpty() == false)
        <td>{{ $auction->bidders->max('bidding_price') }}</td>
          @isset($auction->winner)
            <td>{{ $auction->winner->bidder->user->name }}</td>
          @else
            <td>N/A</td>
          @endisset
        @else
        <td>N/A</td>
        <td>N/A</td>
        @endif
        <td>{{ $auction->auctionStartDate() }}</td>
        <td>{{ $auction->auctionEndDate() }}</td>
        <td class="flex">
          <a href="{{ route('auction.show', ['auction' => $auction->id]) }}" class="btn btn-primary btn-sm">
            <i class="fa fa-eye" aria-hidden="true"></i>
            View
          </a>
          <a href="{{ route('auction.edit', ['auction' => $auction->id]) }}" class="btn btn-warning btn-sm">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
            Edit
          </a>
          <form class="d-inline" action="{{ route('auction.destroy', ['auction' => $auction->id]) }}" method="post">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-danger btn-sm">
              <i class="fa fa-trash" aria-hidden="true"></i>
              Delete
            </button>
          </form>
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
  {{ $auctions->links() }}
</div>

@endsection
